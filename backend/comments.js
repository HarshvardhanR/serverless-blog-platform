
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "./utils/requireAuth.js";

const dynamo = new AWS.DynamoDB.DocumentClient();
const COMMENT_TABLE = process.env.COMMENT_TABLE;

export const createComment = async (event) => {
  try {
    const userId = requireAuth(event);
    const { postId, content } = JSON.parse(event.body ?? "{}");
    if (!postId || !content) return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };

    const commentId = uuidv4();
    const comment = { commentId, postId, userId, content, createdAt: new Date().toISOString() };

    await dynamo.put({ TableName: COMMENT_TABLE, Item: comment }).promise();
    return { statusCode: 201, body: JSON.stringify(comment) };
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ error: err.message }) };
  }
};

export const getComments = async (event) => {
  try {
    const result = await dynamo.scan({ TableName: COMMENT_TABLE }).promise();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.Items),
    };
  } catch (err) {
    console.error("Error fetching comments:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to fetch comments" }) };
  }
};

import { requireAuth } from "./utils/requireAuth.js";

export const getUserComments = async (event) => {
  try {
    const userId = requireAuth(event); // get logged-in user
    const params = {
      TableName: COMMENT_TABLE,
      IndexName: "userCommentsIndex",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
    };
    const result = await dynamo.query(params).promise();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.Items),
    };
  } catch (err) {
    console.error("Error fetching user comments:", err);
    return { statusCode: 401, body: JSON.stringify({ error: err.message }) };
  }
};

export const getPostComments = async (event) => {
  try {
    const postId = event.pathParameters.postId;
    const params = {
      TableName: COMMENT_TABLE,
      IndexName: "postCommentsIndex",
      KeyConditionExpression: "postId = :pid",
      ExpressionAttributeValues: {
        ":pid": postId,
      },
    };
    const result = await dynamo.query(params).promise();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.Items),
    };
  } catch (err) {
    console.error("Error fetching post comments:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to fetch comments" }) };
  }
};
