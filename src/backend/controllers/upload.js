const {
  S3,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const { orderBy } = require("lodash")

const s3 = new S3({
  endpoint: "http://127.0.0.1:4566",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  s3ForcePathStyle: true,
  region: process.env.AWS_REGION,
})

const BUCKET_NAME = process.env.AWS_BUCKET

const UploadController = {
  initializeMultipartUpload: async (req, res) => {
    const { name } = req.body

    const multipartParams = {
      Bucket: BUCKET_NAME,
      Key: `${name}`,
    }

    const multipartUpload = await s3.send(new CreateMultipartUploadCommand(multipartParams))

    res.send({
      fileId: multipartUpload.UploadId,
      fileKey: multipartUpload.Key,
    })
  },

  getMultipartPreSignedUrls: async (req, res) => {
    const { fileKey, fileId, parts } = req.body
    const signedUrls = []

    for (let index = 0; index < parts; index++) {
      signedUrls.push(
        await getSignedUrl(
          s3,
          new UploadPartCommand(
            { Bucket: BUCKET_NAME, Key: fileKey, UploadId: fileId, PartNumber: index + 1 },
            { expiresIn: 3600 },
          ),
        ),
      )
    }

    const partSignedUrlList = signedUrls.map((signedUrl, index) => {
      return {
        signedUrl: signedUrl,
        PartNumber: index + 1,
      }
    })

    res.send({
      parts: partSignedUrlList,
    })
  },

  finalizeMultipartUpload: async (req, res) => {
    const { fileId, fileKey, parts } = req.body

    const multipartParams = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      UploadId: fileId,
      MultipartUpload: {
        // ordering the parts to make sure they are in the right order
        Parts: orderBy(parts, ["PartNumber"], ["asc"]),
      },
    }

    await s3.send(new CompleteMultipartUploadCommand(multipartParams))

    res.send()
  },
}

module.exports = { UploadController }
