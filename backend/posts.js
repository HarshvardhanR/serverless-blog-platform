import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "./utils/requireAuth.js";

const dynamo = new AWS.DynamoDB.DocumentClient();
const POST_TABLE = process.env.POST_TABLE;

export const createPost = async (event) => {
  try {
    const userId = requireAuth(event);
    const { title, content } = JSON.parse(event.body ?? "{}");
    if (!title || !content) return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };

    const postId = uuidv4();
    const post = { postId, userId, title, content, createdAt: new Date().toISOString() };

    await dynamo.put({ TableName: POST_TABLE, Item: post }).promise();
    return { statusCode: 201, body: JSON.stringify(post) };
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ error: err.message }) };
  }
};

// Get all posts (public feed)
export const getPosts = async (event) => {
  try {
    const result = await dynamo.scan({ TableName: POST_TABLE }).promise();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.Items),
    };
  } catch (err) {
    console.error("Error fetching posts:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to fetch posts" }) };
  }
};

// Get posts by logged-in user (using GSI)
export const getUserPosts = async (event) => {
  try {
    const userId = requireAuth(event); // get user from JWT
    const params = {
      TableName: POST_TABLE,
      IndexName: "authorPostsIndex", // your GSI
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
    console.error("Error fetching user posts:", err);
    return { statusCode: 401, body: JSON.stringify({ error: err.message }) };
  }
};

