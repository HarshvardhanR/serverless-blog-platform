import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "./utils/requireAuth.js";

const dynamo = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const POST_TABLE = process.env.POST_TABLE;
const POST_IMAGES_BUCKET = process.env.POST_IMAGES_BUCKET;
const REGION = process.env.AWS_REGION || "ca-central-1";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
};


const handleOptions = (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  return null;
};


const getSignedImageUrl = (key) => {
  if (!key) return null;
  return s3.getSignedUrl("getObject", {
    Bucket: POST_IMAGES_BUCKET,
    Key: key,
    Expires: 60 * 5, // 5 minutes
  });
};


export const createPost = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const userId = requireAuth(event);
    const { title, content, imageUrl } = JSON.parse(event.body ?? "{}");

    if (!title || !content) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Missing title or content" }) };
    }

    const postId = uuidv4();
    const post = {
      postId,
      userId,
      title,
      content,
      imageUrl: imageUrl ?? null, 
      createdAt: new Date().toISOString(),
    };

    await dynamo.put({ TableName: POST_TABLE, Item: post }).promise();

    return { statusCode: 201, headers: corsHeaders, body: JSON.stringify(post) };
  } catch (err) {
    console.error("Error creating post:", err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};


export const getPosts = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const result = await dynamo.scan({ TableName: POST_TABLE }).promise();

    const postsWithSignedUrls = result.Items.map(post => ({
      ...post,
      imageUrl: getSignedImageUrl(post.imageUrl),
    }));

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(postsWithSignedUrls) };
  } catch (err) {
    console.error("Error fetching posts:", err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "Failed to fetch posts" }) };
  }
};


// export const getUserPosts = async (event) => {
//   const optionsResponse = handleOptions(event);
//   if (optionsResponse) return optionsResponse;

//   try {
//     const userId = requireAuth(event);

//     const result = await dynamo.scan({
//       TableName: POST_TABLE,
//       FilterExpression: "userId = :uid",
//       ExpressionAttributeValues: { ":uid": userId },
//     }).promise();

//     const postsWithSignedUrls = result.Items.map(post => ({
//       ...post,
//       imageUrl: getSignedImageUrl(post.imageUrl),
//     }));

//     return {
//       statusCode: 200,
//       headers: corsHeaders,
//       body: JSON.stringify(postsWithSignedUrls),
//     };
//   } catch (err) {
//     console.error("Error fetching user posts:", err);
//     return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
//   }
// };

export const getUserPosts = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  try {
    const userId = requireAuth(event);

    const params = {
      TableName: POST_TABLE,
      IndexName: "userPostsIndex",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
    };

    const result = await dynamo.query(params).promise();

    const postsWithSignedUrls = result.Items.map(post => ({
      ...post,
      imageUrl: getSignedImageUrl(post.imageUrl),
    }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(postsWithSignedUrls),
    };
  } catch (err) {
    console.error("Error fetching user posts:", err);
    return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};



export const getPostById = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    const postId = event.pathParameters?.postId;

    if (!postId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing postId" }),
      };
    }

    // Get the post from DynamoDB
    const result = await dynamo
      .get({ TableName: POST_TABLE, Key: { postId } })
      .promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Post not found" }),
      };
    }

    const post = result.Item;

  
    if (post.imageUrl) {
      post.imageUrl = s3.getSignedUrl("getObject", {
        Bucket: POST_IMAGES_BUCKET,
        Key: post.imageUrl, 
        Expires: 300, 
      });
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(post),
    };
  } catch (err) {
    console.error("Error fetching post by ID:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};


export const getUploadUrl = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders };

  try {
    const userId = requireAuth(event);
    const { fileName, fileType } = JSON.parse(event.body ?? "{}");

    if (!fileName || !fileType) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Missing fileName or fileType" }) };
    }

    const key = `${userId}/${Date.now()}-${fileName}`;

    const uploadUrl = s3.getSignedUrl("putObject", {
      Bucket: POST_IMAGES_BUCKET,
      Key: key,
      ContentType: fileType,
      Expires: 60, 
    });

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ uploadUrl, imageUrl: key }) };
  } catch (err) {
    console.error("Error generating upload URL:", err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};
