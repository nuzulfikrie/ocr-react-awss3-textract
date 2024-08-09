# OCR Application with AWS Services

This project is an Optical Character Recognition (OCR) application that allows users to upload PDF or image files, process them using AWS services, and return the extracted text.

## Architecture Overview

The application consists of the following key components:

- **Frontend:** A responsive web application built with React, providing a user-friendly interface for file uploads and displaying OCR results.
- **Backend:** A Node.js server with Express.js framework, offering RESTful API endpoints for file handling and OCR processing.
- **AWS Services:**
  - Amazon S3 for secure file storage
  - Amazon Textract for advanced OCR processing
  - AWS IAM for secure access management

## Features

- Upload PDF and image files (JPEG, PNG)
- Extract text from documents using Amazon Textract
- Display OCR results in a user-friendly interface
- Secure file storage using Amazon S3
- Improved error handling and file validation

## Setup and Installation

### Prerequisites

- Node.js (v14 or compatible version)
- npm
- AWS account with access to S3 and Textract services

### Step 1: Set Up AWS Services

1. **Create an Amazon S3 Bucket:**

   - Log in to the AWS Management Console.
   - Navigate to the S3 service and create a new bucket (e.g., `my-ocr-app-files`).
   - Enable versioning and server-side encryption.
   - Block all public access.

2. **Configure AWS IAM:**

   - Create a new IAM role with the following permissions:
     - AmazonS3FullAccess
     - AmazonTextractFullAccess
   - Attach a custom policy for specific S3 and Textract access:

     ```json
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Effect": "Allow",
                 "Action": [
                     "s3:PutObject",
                     "s3:GetObject",
                     "s3:ListBucket"
                 ],
                 "Resource": [
                     "arn:aws:s3:::my-ocr-app-files",
                     "arn:aws:s3:::my-ocr-app-files/*"
                 ]
             },
             {
                 "Effect": "Allow",
                 "Action": [
                     "textract:StartDocumentTextDetection",
                     "textract:GetDocumentTextDetection"
                 ],
                 "Resource": "*"
             }
         ]
     }
     ```

### Step 2: Backend Setup

1. **Initialize the Node.js Project:**

   ```bash
 
   cd backend
   npm i
   node server.js
   ```
 2. **Set the environment for Node.js Project:**
 
   ```bash
   AWS_REGION=your-aws-region
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   S3_BUCKET_NAME=bucketname
   PORT=3000
   ```
 3. **Set Frontend:**
 
   ```bash
cd frontend
npm i
npm run start

   ```