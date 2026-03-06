import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { spawn } from "child_process";
import { initializeSocket } from "./socket.js";
import { createClient } from "redis";


const app = express();
// const whitelist = ["http://localhost:5173","http://localhost:5174","http://client:3000","https://localhost:3000","https://streamsx.vercel.app","http://localhost"];

// const whitelist = process.env.CORS_ORIGIN.split(",");

// const corsOptions = {
//   origin: function (origin, callback) {
//     console.log(origin);
//     if (!origin || whitelist.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// };
const corsOptions = {
  origin: true,
  credentials: true,
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subsription.routes.js";
import commentsRouter from "./routes/comments.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import likeRouter from "./routes/like.routes.js";
import liveRouter from "./routes/live.routes.js";
import notificationRouter from "./routes/notification.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("/api/v1/user-playlist", playlistRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/live", liveRouter);
app.use("/api/v1/notifications", notificationRouter);

app.get("/api/health", (req, res) => {
  return res.send("Server is healthy");
});

function callPythonFunction(funcName, args = []) {
  return new Promise((resolve, reject) => {
    const python = spawn("python", [
      "src\\utils\\youtube\\recommendation.py",
      funcName,
      ...args,
    ]);

    let result = "";
    let error = "";

    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (data) => {
      error += data.toString();
    });

    python.on("close", (code) => {
      if (error) {
        reject(error);
      } else {
        try {
          resolve(JSON.parse(result)); // Ensure valid JSON response
        } catch (e) {
          reject("Invalid JSON response");
        }
      }
    });
  });
}

// Example usage
const callpython = (getVideoById, lastindex, func) =>
  callPythonFunction(func, [getVideoById, lastindex])
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return null;
    });

let redisClient;
let server;

try {
  redisClient = createClient({
    username: `${process.env.REDISS_USERNAME}`,
    password: `${process.env.PASSWORD}`,
    socket: {
      host: `${process.env.HOST}`,
      port: `${process.env.RADISS_PORT}`,
    },
  });
  redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
  });
  await redisClient.connect();
  console.log("Connected to Redis");
} catch (error) {
  console.log(error.message);
  throw error;
}

try {
  server = createServer(app);
  initializeSocket({ server });
} catch (error) {
  console.log(error.message);
}

export { server, redisClient, callpython };
