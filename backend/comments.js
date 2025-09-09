import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "./utils/requireAuth.js";

const dynamo = new AWS.DynamoDB.DocumentClient();
const COMMENT_TABLE = process.env.COMMENT_TABLE;
const USERS_TABLE = process.env.USER_TABLE;


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
};


const handleOptions = (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  return null;
};


export const createComment = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const userId = requireAuth(event);
    const { postId, content } = JSON.parse(event.body ?? "{}");

    if (!postId || !content || content.trim().length === 0) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Missing or invalid fields" }) };
    }
    if (content.length > 500) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Comment too long (max 500 chars)" }) };
    }

  
    const { Item: user } = await dynamo.get({
      TableName: USERS_TABLE,
      Key: { userId },
    }).promise();

    const commentId = uuidv4();
    const comment = {
      commentId,
      postId,
      userId,
      name: user?.name || "Unknown", 
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    await dynamo.put({ TableName: COMMENT_TABLE, Item: comment }).promise();

    return { statusCode: 201, headers: corsHeaders, body: JSON.stringify(comment) };
  } catch (err) {
    console.error("Auth/Creation error:", err);
    return { statusCode: err.message?.includes("Unauthorized") ? 401 : 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};


export const getComments = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const limit = Number(event.queryStringParameters?.limit) || 20;
    const lastKey = event.queryStringParameters?.lastKey
      ? JSON.parse(decodeURIComponent(event.queryStringParameters.lastKey))
      : undefined;

    const result = await dynamo.scan({
      TableName: COMMENT_TABLE,
      Limit: limit,
      ExclusiveStartKey: lastKey,
    }).promise();

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ items: result.Items, lastKey: result.LastEvaluatedKey }) };
  } catch (err) {
    console.error("Error fetching comments:", err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "Failed to fetch comments" }) };
  }
};


export const getUserComments = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const userId = requireAuth(event);
    const result = await dynamo.query({
      TableName: COMMENT_TABLE,
      IndexName: "userCommentsIndex",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
    }).promise();

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result.Items) };
  } catch (err) {
    console.error("Error fetching user comments:", err);
    return { statusCode: err.message?.includes("Unauthorized") ? 401 : 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};


export const getPostComments = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const postId = event.pathParameters?.postId;
    if (!postId) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Missing postId" }) };
    }

    const result = await dynamo.query({
      TableName: COMMENT_TABLE,
      IndexName: "postCommentsIndex",
      KeyConditionExpression: "postId = :pid",
      ExpressionAttributeValues: { ":pid": postId },
    }).promise();

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result.Items) };
  } catch (err) {
    console.error("Error fetching post comments:", err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "Failed to fetch comments" }) };
  }
};

export const updateComment = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const userId = requireAuth(event);
    const { commentId, content } = JSON.parse(event.body ?? "{}");

    if (!commentId || !content) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Missing fields" }) };
    }
    if (content.length > 500) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Comment too long" }) };
    }

    const result = await dynamo.update({
      TableName: COMMENT_TABLE,
      Key: { commentId },
      ConditionExpression: "userId = :uid",
      UpdateExpression: "SET content = :c, updatedAt = :u",
      ExpressionAttributeValues: {
        ":uid": userId,
        ":c": content.trim(),
        ":u": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    }).promise();

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result.Attributes) };
  } catch (err) {
    console.error("Error updating comment:", err);
    return { statusCode: err.code === "ConditionalCheckFailedException" ? 403 : 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};

export const deleteComment = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const userId = requireAuth(event);
    const { commentId } = JSON.parse(event.body ?? "{}");

    if (!commentId) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Missing commentId" }) };
    }

    await dynamo.delete({
      TableName: COMMENT_TABLE,
      Key: { commentId },
      ConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
    }).promise();

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("Error deleting comment:", err);
    return { statusCode: err.code === "ConditionalCheckFailedException" ? 403 : 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};
