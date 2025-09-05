
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
