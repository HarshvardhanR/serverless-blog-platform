import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "./utils/requireAuth.js";

const dynamo = new AWS.DynamoDB.DocumentClient();
const POST_TABLE = process.env.POST_TABLE;

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

// Create a new post
export const createPost = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const userId = requireAuth(event);
    const { title, content } = JSON.parse(event.body ?? "{}");

    if (!title || !content) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing fields" }),
      };
    }

    const postId = uuidv4();
    const post = {
      postId,
      userId,
      title,
      content,
      createdAt: new Date().toISOString(),
    };

    await dynamo.put({ TableName: POST_TABLE, Item: post }).promise();

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify(post),
    };
  } catch (err) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// Get all posts (public feed)
export const getPosts = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const result = await dynamo.scan({ TableName: POST_TABLE }).promise();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.Items),
    };
  } catch (err) {
    console.error("Error fetching posts:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to fetch posts" }),
    };
  }
};

// Get posts by logged-in user (using GSI)
export const getUserPosts = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const userId = requireAuth(event);

    const params = {
      TableName: POST_TABLE,
      IndexName: "authorPostsIndex", // your GSI
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
    console.error("Error fetching user posts:", err);
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

export const getPostById = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const postId = event.pathParameters?.postId;
    if (!postId) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Missing postId" }) };
    }

    const result = await dynamo.get({ TableName: POST_TABLE, Key: { postId } }).promise();

    if (!result.Item) {
      return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: "Post not found" }) };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.Item),
    };
  } catch (err) {
    console.error("Error fetching post by ID:", err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};

