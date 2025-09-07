# Serverless Blog Platform

A **Serverless Blog Platform** built with **React**, **AWS Lambda**, **DynamoDB**, and **S3**. Users can create posts with optional images, view posts, and comment on them. The platform uses JWT-based authentication and supports image uploads via signed URLs.

---

## Features

- User authentication with JWT
- Create, read, and comment on posts
- Upload images to S3 and display them with signed URLs
- Serverless backend with AWS Lambda
- DynamoDB as a NoSQL database
- Responsive React frontend
- Real-time comments fetching and posting

---

## Tech Stack

**Frontend:**
- React
- React Router
- Axios
- Tailwind CSS

**Backend:**
- AWS Lambda
- AWS S3
- AWS DynamoDB
- Node.js
- UUID for unique identifiers

---

## Project Structure

serverless-blog/
├─ frontend/
│ ├─ src/
│ │ ├─ components/ # React components (PostForm, PostDetails, etc.)
│ │ ├─ pages/ # Pages like Dashboard, PostDetails
│ │ └─ App.js
├─ backend/
│ ├─ posts.js # CRUD operations for posts
│ ├─ comments.js # CRUD operations for comments
│ ├─ utils/ # Helper functions like requireAuth.js
│ └─ serverless.yml # Serverless Framework config (optional)
├─ README.md
└─ package.json


---

## Setup

### Prerequisites

- Node.js >= 18
- AWS Account
- AWS CLI configured with credentials
- npm or yarn
- Optional: Serverless Framework for deployment

---

### Backend Setup

1. Install dependencies:

```bash
cd backend
npm install aws-sdk uuid

POST_TABLE=YourDynamoDBTableName
POST_IMAGES_BUCKET=YourS3BucketName
AWS_REGION=ca-central-1


serverless deploy
