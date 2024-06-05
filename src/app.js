import express from "express";
import cookieparser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieparser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.static("public"));

//routes import
import userRouter from "./routes/user.routes.js";
import photoRouter from "./routes/photo.routes.js";

//route execution
app.use("/api/v1/user", userRouter);
app.use("/api/v1/photo", photoRouter);

export { app };
