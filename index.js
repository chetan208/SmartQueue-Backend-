import { configDotenv } from 'dotenv';


configDotenv();

import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';

import hospitalRouter from './routes/hospitalRoutes.js'
import userRouter from './routes/userRoute.js'
import cors from 'cors';



// db connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB'))


const app = express();

const PORT = process.env.PORT;

//cors
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});