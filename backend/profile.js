import AWS from "aws-sdk";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const s3 = new AWS.S3();
const POST_IMAGES_BUCKET = process.env.POST_IMAGES_BUCKET;
const JWT_SECRET = process.env.JWT_SECRET;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
};

const getUserIdFromEvent = (event) => {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  if (!authHeader) throw new Error("Missing Authorization header");

  const token = authHeader.replace(/^Bearer\s+/i, "");
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
};

export const getProfileUploadUrl = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders };

  try {
    const userId = getUserIdFromEvent(event);
    const fileExt = event.queryStringParameters?.ext || "png";
    const fileKey = `profile/${userId}/${uuidv4()}.${fileExt}`;

    const uploadUrl = s3.getSignedUrl("putObject", {
      Bucket: POST_IMAGES_BUCKET,
      Key: fileKey,
      ContentType: `image/${fileExt}`,
      Expires: 300, // 5 minutes
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        uploadUrl, 
        key: fileKey 
      }),
    };
  } catch (err) {
    console.error("Error generating profile upload URL:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
