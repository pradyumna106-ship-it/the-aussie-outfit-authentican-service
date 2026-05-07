import express from "express";
import router from "./route/auth.js";

const app = express();

app.use(express.json());

app.use("/api/auth", router);

export default app;