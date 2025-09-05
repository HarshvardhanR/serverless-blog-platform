// utils/requireAuth.js
import { verifyToken } from "./auth.js";

export const requireAuth = (event) => {
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader) throw new Error("Unauthorized: No token provided");

  const token = authHeader.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded) throw new Error("Unauthorized: Invalid token");

  return decoded.userId;
};
