import express from "express";
import cors from "cors";

import router from "./route/auth.js";

const app = express();


// =====================================
// CORS
// =====================================
app.use(
  cors({
    origin: "*",

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ],

    credentials: true
  })
);


// =====================================
// BODY PARSER
// =====================================
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);


// =====================================
// ROUTES
// =====================================
app.use("/", router);


export default app;