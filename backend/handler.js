import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { hashedPassword } from "./utils/auth.js";

const dynamo = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;

export const signup = async (event) => {
  try {
    const { name, email, password } = JSON.parse(event.body ?? "{}");

    if (!name || !email || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
    }

    const passwordHash = await hashedPassword(password);
    const userId = uuidv4();

    const user = {
      userId,
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await dynamo.put({ TableName: USERS_TABLE, Item: user }).promise();

    return { statusCode: 201, body: JSON.stringify({ userId, name, email }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
