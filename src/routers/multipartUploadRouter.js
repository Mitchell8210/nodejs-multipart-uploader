"use strict";

const {
  listMultipartUploads,
  getSignedUrlsForUploadInProgress,
  createMultipartUpload,
  completeMultipartUpload,
  generateMultipartUploadLink,
  cancelMultipartUpload,
} = require("../modules/multipartUploadModule.js");

// prefix /uploader
const router = require("express").Router();

require("dotenv").config();

// router endpoints ====================================================
router.get("/uploads", async (req, res) => {
  const result = await listMultipartUploads();

  res.json(result);
});

// use the other endpoint to get upload link

router.post("/generate-upload-links", async (req, res) => {
  const { fileName, parts, uploadId } = req.body;

  const result = await getSignedUrlsForUploadInProgress(
    fileName,
    parts,
    uploadId
  );

  res.json(result);
});

router.post("/create-multipart-upload", async (req, res) => {
  const { fileName } = req.body;
  const result = await createMultipartUpload(fileName);

  res.json(result);
});

router.post("/complete-multipart-upload", async (req, res) => {
  const { fileName, parts, uploadId } = req.body;

  const result = await completeMultipartUpload(fileName, parts, uploadId);

  res.json(result);
});

router.post("/generate-multipart-upload-link", async (req, res) => {
  const { fileName, uploadId, partNumber, hash } = req.body;

  const result = await generateMultipartUploadLink(
    fileName,
    uploadId,
    partNumber,
    hash
  );

  res.json(result);
});

router.post("/cancel-multipart-upload", async (req, res) => {
  const { fileName, uploadId } = req.body;

  const result = await cancelMultipartUpload(uploadId, fileName);

  res.json(result);
});

// export router
module.exports = router;
