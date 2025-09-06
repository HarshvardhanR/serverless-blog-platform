import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "./utils/requireAuth.js";

const dynamo = new AWS.DynamoDB.DocumentClient();
const COMMENT_TABLE = process.env.COMMENT_TABLE;

// Helper function to return CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
};

// Handle preflight OPTIONS requests
const handleOptions = (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }
  return null;
};

// Create a new comment
export const createComment = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const userId = requireAuth(event);
    const { postId, content } = JSON.parse(event.body ?? "{}");

    if (!postId || !content) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing fields" }),
      };
    }

    const commentId = uuidv4();
    const comment = {
      commentId,
      postId,
      userId,
      content,
      createdAt: new Date().toISOString(),
    };

    await dynamo.put({ TableName: COMMENT_TABLE, Item: comment }).promise();

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify(comment),
    };
  } catch (err) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// Get all comments
export const getComments = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const result = await dynamo.scan({ TableName: COMMENT_TABLE }).promise();
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.Items),
    };
  } catch (err) {
    console.error("Error fetching comments:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to fetch comments" }),
    };
  }
};

// Get comments by logged-in user
export const getUserComments = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const userId = requireAuth(event); // logged-in user
    const params = {
      TableName: COMMENT_TABLE,
      IndexName: "userCommentsIndex",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
    };

    const result = await dynamo.query(params).promise();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.Items),
    };
  } catch (err) {
    console.error("Error fetching user comments:", err);
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// Get comments for a specific post
export const getPostComments = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const postId = event.pathParameters?.postId;
    if (!postId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing postId" }),
      };
    }

    const params = {
      TableName: COMMENT_TABLE,
      IndexName: "postCommentsIndex",
      KeyConditionExpression: "postId = :pid",
      ExpressionAttributeValues: { ":pid": postId },
    };

    const result = await dynamo.query(params).promise();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.Items),
    };
  } catch (err) {
    console.error("Error fetching post comments:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to fetch comments" }),
    };
  }
};
