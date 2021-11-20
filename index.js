const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

dotenv.config()
const app = express()
// middleWare
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

aws.config.update({
  apiVersion: '2006-03-01',
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey,
  region: process.env.AWSRegion
})

const s3 = new aws.S3()
const pathS3 = 'testing' // path location or object s3 bucket
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: `${process.env.AWSBucket}/${pathS3}`,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname })
    },
    key: (req, file, cb) => {
      cb(null, `${Date.now().toString()}-${file.originalname}`)
    }
  })
})

app.get('/', async (req, res) => {
  res.status(200).send('S3 Upload Backend')
})

app.post('/', upload.single('photo'), async (req, res) => {
  console.log(req.file)
  try {
    res.status(201).json({ file: req.file.location })
  } catch (err) {
    res.status(500).send({
      error: 'error occured creating user'
    })
  }
})
const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`server started on port ${port}`)
})
