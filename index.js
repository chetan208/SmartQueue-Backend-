import { configDotenv } from 'dotenv';


configDotenv();

import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';

import hospitalRouter from './routes/hospitalRoutes.js'
import userRouter from './routes/userRoute.js'
import cors from 'cors';
import http from "http";
import { Server } from "socket.io";



// db connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB'))


const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT;

//cors
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// socket.io setup
export const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true }
});

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));




app.get('/', (req, res) => {
  res.send("hello from server")
});

// routes
app.use('/api/hospitals',hospitalRouter)
app.use('/api/users',userRouter)

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

   socket.on("join-department", (department) => {
    socket.join(`user-${department}`);
    console.log(`${socket.id} joined user-${department}`);
  });

  // Admin joins department-admin
  socket.on("join-department-admin", (department) => {
    socket.join(`admin-${department}`);
    console.log(`${socket.id} joined admin-${department}`);
  });
});