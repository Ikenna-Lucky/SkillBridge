import express from "express";
import cors from "cors"; // The cors helps to connect my backend to my frontend
import "dotenv/config"; //imports and config the dotenv(.env) library
import cookieParser from "cookie-parser"; // create a cookieParser middle which analyses cookies attached to incoming Http request
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoute.js";

//Creating an express application
const app = express();
const port = process.env.PORT || 4000; // Here process.env is a object in Node.js that helps to access the env variable
connectDB();

const allowedOrigins = ["https://skillbridge-qvap.onrender.com"]; // the port at which your frontend is running on.

app.use(express.json()); //All request made will be passed in JSON format. in other words, it allows my API to understand and process data sent in JSON format
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());

// API Endpoint
app.get("/", (req, res) => {
  res.send("API is working");
});
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.listen(port, () => {
  console.log(`My server is running on PORT:${port}`);
});
