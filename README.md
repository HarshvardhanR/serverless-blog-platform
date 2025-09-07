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
│  │  ├─ components/       # React components (PostForm, PostDetails, etc.)
│  │  ├─ pages/            # Pages like Dashboard, PostDetails
│  │  └─ App.js
├─ backend/
│  ├─ posts.js              # CRUD operations for posts
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
POST_IMAGES_BUCKET=YourS3BucketName
AWS_REGION=ca-central-1
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
REACT_APP_API_URL=https://your-api-gateway-url
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

---

## Screenshots

![Dashboard](screenshots/dashboard.png)
![Post Details](screenshots/post-details.png)
![Image Upload](screenshots/upload.png)

> *Tip: Capture screenshots of your running frontend and store them in `frontend/screenshots` for reference.*

---

## Deployment

* Backend deployed using **AWS Lambda** and **API Gateway**.
* Posts and comments stored in **DynamoDB**.
* Images stored in **S3**, accessed via **signed URLs**.
* Frontend hosted locally or via **Netlify / Vercel**.

---

## Notes / Tips

* Ensure **CORS** is properly configured in AWS API Gateway.
* All protected endpoints require a valid **JWT token**.
* S3 signed URLs expire after 5 minutes — handle expired URLs gracefully.
* Use browser dev tools to debug image URLs if they don’t appear.

---

## License

MIT License

---

## Author

**Harshvardhansingh Rao**

* GitHub: [github.com/yourusername](https://github.com/yourusername)
* LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)

---

## Future Enhancements

* Add **like/dislike** functionality for posts.
* Pagination for posts and comments.
* Real-time updates with **WebSockets** or **AWS AppSync**.
* User profile pages with post history.
* Notifications for new comments on user posts.
