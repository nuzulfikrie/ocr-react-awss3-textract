// server.js
const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enhanced security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();
const textract = new AWS.Textract();

// Multer setup for file upload with file type validation
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'));
  }
};
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

// Upload route with error handling
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `uploads/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Upload to S3
    const s3UploadResult = await s3.upload(uploadParams).promise();

    // Start Textract Job
    const textractParams = {
      DocumentLocation: {
        S3Object: {
          Bucket: s3UploadResult.Bucket,
          Name: s3UploadResult.Key,
        },
      },
    };
    const textractResult = await textract.startDocumentTextDetection(textractParams).promise();

    res.json({ jobId: textractResult.JobId });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Result retrieval route
app.get('/result/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const params = { JobId: jobId };

    const data = await textract.getDocumentTextDetection(params).promise();

    if (data.JobStatus === 'IN_PROGRESS') {
      return res.status(202).json({ message: 'Processing in progress' });
    }

    if (data.JobStatus === 'FAILED') {
      return res.status(500).json({ error: 'Text extraction failed' });
    }

    const blocks = data.Blocks.filter(block => block.BlockType === 'LINE');
    const text = blocks.map(block => block.Text).join('\n');

    res.json({ text });
  } catch (error) {
    console.error('Error retrieving result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});