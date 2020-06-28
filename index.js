require('dotenv/config');

const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const uuid = require('uuid');
const sharp = require('sharp');

const app = express();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, '');
  },
});

const upload = multer({ storage }).single('image');

app.post('/upload', upload, (req, res) => {
  let myFile = req.file.originalname.split('.');
  const fileType = myFile[myFile.length - 1];
  const random = uuid.v4();

  const params = [
    {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `xl-${random}.${fileType}`,
      Body: sharp(req.file.buffer).resize(1000).png(),
    },
    {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `lg-${random}.${fileType}`,
      Body: sharp(req.file.buffer).resize(800),
    },
    {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `med-${random}.${fileType}`,
      Body: sharp(req.file.buffer).resize(600),
    },
    {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `sm-${random}.${fileType}`,
      Body: sharp(req.file.buffer).resize(400),
    },
    {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `xs-${random}.${fileType}`,
      Body: sharp(req.file.buffer).resize(200),
    },
    {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `original-${random}.${fileType}`,
      Body: sharp(req.file.buffer),
    },
  ];

  for (let i = 0; i < params.length; i++) {
    s3.upload(params[i], (error, data) => {
      if (error) {
        //   res.status(500).send(error);
        console.error(error);
      }
      // res.status(200).json({ data });
      console.log(data);
    });
  }
  res.json({ profile: `${random}.${fileType}` });
});

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});
