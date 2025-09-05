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
