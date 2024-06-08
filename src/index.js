"use strict";

const cors = require("cors");
require("dotenv").config();

const express = require("express");
const app = express();

app.use(cors());
const bodyParser = require("body-parser");

app.use(
  bodyParser.urlencoded({ extended: true, limit: "50mb" }),
  bodyParser.json({ limit: "50mb" })
);

// routers
const multipartUploadRouter = require("./routers/multipartUploadRouter.js");
app.use("/uploader", multipartUploadRouter);

const port = 8080;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
