import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import customerRoutes from "./routes/customerRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import fraudRoutes from "./routes/fraudRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// ✅ Routes
app.use("/api/customers", customerRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/fraud", fraudRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/search", searchRoutes);

// ✅ Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('auth', ({ userId }) => {
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined room`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// ✅ Root
app.get("/", (req, res) => res.send("🌍 E-commerce backend running!"));

// ✅ Start Server
const PORT = process.env.PORT || 5050;
httpServer.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT} and listening on all interfaces`));
