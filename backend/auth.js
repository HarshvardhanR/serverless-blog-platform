
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { hashPassword, comparePassword, generateToken } from "./utils/auth.js";

const dynamo = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USER_TABLE;

export const register = async (event) => {
  const { name, email, password } = JSON.parse(event.body ?? "{}");
  if (!name || !email || !password) return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };

  const passwordHash = await hashPassword(password);
  const userId = uuidv4();

  await dynamo.put({
    TableName: USERS_TABLE,
    Item: { userId, name, email, passwordHash, createdAt: new Date().toISOString() },
  }).promise();

  return { statusCode: 201, body: JSON.stringify({ userId, name, email }) };
};

export const login = async (event) => {
  const { email, password } = JSON.parse(event.body ?? "{}");
  if (!email || !password) return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };

  const { Items } = await dynamo.query({
    TableName: USERS_TABLE,
    IndexName: "EmailIndex", 
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: { ":email": email },
  }).promise();

  const user = Items?.[0];
  if (!user) return { statusCode: 404, body: JSON.stringify({ error: "User not found" }) };

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) return { statusCode: 401, body: JSON.stringify({ error: "Invalid credentials" }) };

  const token = generateToken(user.userId);
  return { statusCode: 200, body: JSON.stringify({ token }) };
};
