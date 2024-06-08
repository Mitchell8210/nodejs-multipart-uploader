const {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  S3Client,
  ListMultipartUploadsCommand,
  ListPartsCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

require("dotenv").config();

const AWS_BUCKET = process.env.AWS_BUCKET;
const AWS_REGION = process.env.AWS_REGION;
const AWS_KEY = process.env.AWS_KEY;
const AWS_SECRET = process.env.AWS_SECRET;

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_KEY,
    secretAccessKey: AWS_SECRET,
  },
});

// create multipart upload
const createMultipartUpload = async (fileName) => {
  const multipartUpload = await s3Client.send(
    new CreateMultipartUploadCommand({
      Bucket: AWS_BUCKET,
      Key: fileName,
    })
  );

  const uploadId = multipartUpload.UploadId;

  return { uploadId };
};

// generate upload link from upload id
const generateMultipartUploadLink = async (
  fileName,
  uploadId,
  partNumber,
  hash
) => {
  const command = new UploadPartCommand({
    Bucket: AWS_BUCKET,
    Key: fileName,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 15 * 60,
    ContentMD5: btoa(hash),
  });

  return { url };
};

// complete upload
const completeMultipartUpload = async (fileName, parts, uploadId) => {
  return await s3Client.send(
    new CompleteMultipartUploadCommand({
      Bucket: AWS_BUCKET,
      Key: fileName,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts,
      },
    })
  );
};

// cancel upload
const cancelMultipartUpload = async (uploadId, key) => {
  const abortCommand = new AbortMultipartUploadCommand({
    Bucket: AWS_BUCKET,
    Key: key,
    UploadId: uploadId,
  });

  await s3Client.send(abortCommand);
};

const listMultipartUploads = async () => {
  const uploads = await s3Client.send(
    new ListMultipartUploadsCommand({
      Bucket: AWS_BUCKET,
    })
  );

  const list = [];
  if (uploads.Uploads) {
    for (let i = 0; i < uploads?.Uploads.length; i++) {
      const upload = uploads?.Uploads[i];
      const parts = await listParts(upload);
      list.push({ upload, parts });
    }
  }

  return list;
};

const listParts = async (upload) => {
  const parts = [];

  let currentParts = await s3Client.send(
    new ListPartsCommand({
      Bucket: AWS_BUCKET,
      Key: upload.Key,
      UploadId: upload.UploadId,
    })
  );

  if (currentParts.Parts) {
    parts.push(...currentParts.Parts);
  }

  while (currentParts.IsTruncated) {
    currentParts = await s3Client.send(
      new ListPartsCommand({
        Bucket: AWS_BUCKET,
        Key: upload.Key,
        UploadId: upload.UploadId,
        MaxParts: 100,
        PartNumberMarker: currentParts.NextPartNumberMarker,
      })
    );
    parts.push(...currentParts.Parts);
  }

  const returnable = { ...currentParts, Parts: parts };
  return returnable;
};

const getSignedUrlsForUploadInProgress = async (fileName, parts, uploadId) => {
  const presignedUrls = [];
  for (let i = 0; i < parts.length; i++) {
    const partNumber = parts[i].partNumber;

    // match the pattern of AWS.
    const hash = `"${parts[i].hash}"`;

    const command = new UploadPartCommand({
      Bucket: AWS_BUCKET,
      Key: fileName,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 15 * 60,
      ContentMD5: btoa(hash),
    });

    presignedUrls.push({ url, partNumber });
  }

  return presignedUrls;
};

module.exports = {
  createMultipartUpload,
  generateMultipartUploadLink,
  completeMultipartUpload,
  cancelMultipartUpload,
  listMultipartUploads,
  getSignedUrlsForUploadInProgress,
};
