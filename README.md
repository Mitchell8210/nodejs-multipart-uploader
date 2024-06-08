# NodeJS Multipart uploader

This project is a starting point for managing multipart uploads to AWS S3 buckets without the need for the file to pass through the server which will save time, effort, and money by leveraging a client to do the upload directly to S3 via presigned Urls.

This nodeJS server is designed to act as a backend that will be able to securly generate the presigned Urls and to provide a client with the necessary information to manage multipart uploads with the ability to resume the upload if a connection is lost.

