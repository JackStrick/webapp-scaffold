// Auth middleware stub — uncomment and configure to enable JWT authentication
//
// import type { RequestHandler } from "express";
// import jwt from "jsonwebtoken";
//
// export const requireAuth: RequestHandler = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//
//   if (!token) {
//     res.status(401).json({ error: "Unauthorized" });
//     return;
//   }
//
//   try {
//     const payload = jwt.verify(token, process.env.JWT_SECRET!);
//     (req as any).user = payload;
//     next();
//   } catch {
//     res.status(401).json({ error: "Invalid token" });
//   }
// };
//
// Dependencies to add:
//   npm install jsonwebtoken
//   npm install -D @types/jsonwebtoken
//
// Add to .env:
//   JWT_SECRET=your-secret-here

export {};
