import AWS from "aws-sdk";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { hashPassword, comparePassword, generateToken } from "./utils/auth.js";
const JWT_SECRET = process.env.JWT_SECRET;

const dynamo = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const USERS_TABLE = process.env.USER_TABLE;
const POST_IMAGES_BUCKET = process.env.POST_IMAGES_BUCKET;

const getSignedProfileUrl = (key) => {
  if (!key) return null;
  return s3.getSignedUrl("getObject", {
    Bucket: POST_IMAGES_BUCKET,
    Key: key,
    Expires: 300, 
  });
};

export const register = async (event) => {
  const { name, email, password } = JSON.parse(event.body ?? "{}");
  if (!name || !email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
  }


  const existing = await dynamo.query({
    TableName: USERS_TABLE,
    IndexName: "EmailIndex",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: { ":email": email },
  }).promise();

  if (existing.Items.length > 0) {
    return { statusCode: 409, body: JSON.stringify({ error: "Email already exists" }) };
  }

  const passwordHash = await hashPassword(password);
  const userId = uuidv4();

  await dynamo.put({
    TableName: USERS_TABLE,
    Item: {
      userId,
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    },
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({ userId, name, email }),
  };
};

export const login = async (event) => {
  const { email, password } = JSON.parse(event.body ?? "{}");
  if (!email || !password)
    return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };

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

export const me = async (event) => {
  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) return { statusCode: 401, body: JSON.stringify({ error: "Missing Authorization header" }) };

    const token = authHeader.replace(/^Bearer\s+/i, "");
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return { statusCode: 401, body: JSON.stringify({ error: "Invalid token" }) };
    }

    const { Item: user } = await dynamo.get({
      TableName: USERS_TABLE,
      Key: { userId: decoded.userId },
    }).promise();

    if (!user) return { statusCode: 404, body: JSON.stringify({ error: "User not found" }) };

    const { passwordHash, ...safeUser } = user;

    if (safeUser.profileImage) {
      safeUser.profileImage = getSignedProfileUrl(safeUser.profileImage);
    }

    return { statusCode: 200, body: JSON.stringify(safeUser) };
  } catch (err) {
    console.error("Error in /auth/me:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal server error" }) };
  }
};

export const updateMe = async (event) => {
  try {
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    if (!authHeader) return { statusCode: 401, body: JSON.stringify({ error: "Missing Authorization header" }) };

    const token = authHeader.replace(/^Bearer\s+/i, "");
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return { statusCode: 401, body: JSON.stringify({ error: "Invalid or expired token" }) };
    }

    const body = JSON.parse(event.body ?? "{}");
    const { name, profileImage } = body;

    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (name) {
      updateExpression.push("#name = :name");
      expressionAttributeNames["#name"] = "name";
      expressionAttributeValues[":name"] = name;
    }

    if (profileImage) {
      updateExpression.push("profileImage = :profileImage");
      expressionAttributeValues[":profileImage"] = profileImage;
    }

    if (!updateExpression.length) {
      return { statusCode: 400, body: JSON.stringify({ error: "Nothing to update" }) };
    }

    await dynamo.update({
      TableName: USERS_TABLE,
      Key: { userId: decoded.userId },
      UpdateExpression: "SET " + updateExpression.join(", "),
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    }).promise();


    const { Item: user } = await dynamo.get({
      TableName: USERS_TABLE,
      Key: { userId: decoded.userId },
    }).promise();

    const { passwordHash, ...safeUser } = user;

    if (safeUser.profileImage) {
      safeUser.profileImage = getSignedProfileUrl(safeUser.profileImage);
    }

    return { statusCode: 200, body: JSON.stringify(safeUser) };
  } catch (err) {
    console.error("Error in updateMe:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal server error" }) };
  }
};
