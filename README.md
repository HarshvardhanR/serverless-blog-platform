# Serverless Blog Platform

A **Serverless Blog Platform** built with **React**, **AWS Lambda**, **DynamoDB**, and **S3**.
Users can create posts with optional images, view posts, and comment on them.
The platform uses JWT-based authentication and supports image uploads via signed URLs.

---

## Features

* User authentication with JWT
* Create, read, and comment on posts
* Upload images to S3 and display them with signed URLs
* Serverless backend with AWS Lambda
* DynamoDB as a NoSQL database
* Responsive React frontend
* Real-time comments fetching and posting

---

## Tech Stack

**Frontend:**

* React
* React Router
* Axios
* Tailwind CSS

**Backend:**

* AWS Lambda
* AWS S3
* AWS DynamoDB
* Node.js
* UUID for unique identifiers

---

## Project Structure

```
serverless-blog/
├─ frontend/
│  ├─ src/
│  │  ├─ components/       # React components (PostForm, PostCard, etc.)
│  │  ├─ pages/            # Pages like Dashboard, PostDetails
│  │  └─ App.js
├─ backend/
│  ├─ auth.js               # for authentication
|  ├─ posts.js              # CRUD operations for posts
│  ├─ comments.js           # CRUD operations for comments
│  ├─ utils/                # Helper functions like requireAuth.js
│  └─ serverless.yml        # Serverless Framework config (optional)
├─ README.md
└─ package.json
```

---

## Setup

### Prerequisites

* Node.js >= 18
* AWS Account
* AWS CLI configured
* npm or yarn
* Optional: Serverless Framework

### Backend Setup

1. Install dependencies:

```bash
cd backend
npm install aws-sdk uuid
```

2. Configure environment variables in `.env`:

```env
POST_TABLE=YourDynamoDBTableName
COMMENT_TABLE=YourDynamoDBTableName
USER_TABLE=YourDynamoDBTableName
POST_IMAGES_BUCKET=YourS3BucketName
JWT_SECRET=YourSuperSecretKey
```

3. Deploy Lambda functions to AWS:

```bash
serverless deploy
```

### Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Create `.env` file and add API URL:

```env
VITE_API_BASE_URL=https://your-api-gateway-url
```

3. Start the development server:

```bash
npm start
```

---

## API Endpoints

### Posts

| Method | Endpoint          | Description                     |
| ------ | ----------------- | ------------------------------- |
| GET    | `/posts`          | Get all posts                   |
| GET    | `/posts/{postId}` | Get a post by ID                |
| POST   | `/posts`          | Create a new post               |
| GET    | `/user/posts`     | Get posts by authenticated user |

### Comments

| Method | Endpoint                  | Description             |
| ------ | ------------------------- | ----------------------- |
| GET    | `/comments/post/{postId}` | Get comments for a post |
| POST   | `/comments`               | Add a new comment       |

### Images

| Method | Endpoint        | Description                     |
| ------ | --------------- | ------------------------------- |
| GET    | `/posts/upload` | Get signed URL for image upload |

---

## Usage

1. Sign up or log in.
2. Navigate to the dashboard to view all posts.
3. Create a new post with optional image upload.
4. Click on a post to view details and comments.
5. Add comments in real-time.


## Deployment

* Backend deployed using **AWS Lambda** and **API Gateway**.
* Users, Posts and comments stored in **DynamoDB**.
* Images stored in **S3**, accessed via **signed URLs**.


## Author

**Harshvardhansingh Rao**

* GitHub: [github.com/HarshvardhanR](https://github.com/HarshvardhanR)
* LinkedIn: [linkedin.com/in/harshvardhansingh-rao](https://www.linkedin.com/in/harshvardhansingh-rao-a63929222/)
