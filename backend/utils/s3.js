const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Initialize S3 Client targeting the Railway Bucket
const s3Client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT, // e.g., https://s3.storageapi.dev
      credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
      // Some external S3 providers need this to prevent the SDK from
      // attempting to query metadata endpoints that don't exist
      tls: true
});

/**
 * Uploads a file buffer to S3 and returns the public URL
 * @param {Buffer} fileBuffer The file buffer from multer
 * @param {string} originalName The original filename
 * @param {string} mimetype The file mimetype
 * @returns {Promise<string>} The public URL of the uploaded image
 */
const uploadToS3 = async (fileBuffer, originalName, mimetype) => {
      try {
            // Generate unique filename to prevent overwrites
            const extension = path.extname(originalName);
            const fileName = `kyc/${uuidv4()}${extension}`;

            const command = new PutObjectCommand({
                  Bucket: process.env.S3_BUCKET_NAME,
                  Key: fileName,
                  Body: fileBuffer,
                  ContentType: mimetype
                  // Railway buckets manage ACLs via project settings; overriding through SDK throws errors
            });

            await s3Client.send(command);

            // Construct the public URL correctly for Path Style
            // Format: https://[endpoint-domain]/[bucket-name]/[key]
            const endpointDomain = process.env.S3_ENDPOINT.replace(/\/$/, "");
            const publicUrl = `${endpointDomain}/${process.env.S3_BUCKET_NAME}/${fileName}`;

            return publicUrl;
      } catch (error) {
            console.error("S3 Upload Error:", error);
            throw new Error('Failed to upload document to cloud storage.');
      }
}

/**
 * Generates a temporary, pre-signed public URL for viewing private S3 objects
 * @param {string} fileKey the filename key stored in the DB (e.g. kyc/abc.jpeg)
 * @returns {Promise<string>} The temporary Signed URL
 */
const generatePresignedUrl = async (fileKey) => {
      try {
            const command = new GetObjectCommand({
                  Bucket: process.env.S3_BUCKET_NAME,
                  Key: fileKey,
            });

            // Creates a URL that naturally expires in 1 hour (3600 seconds)
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            return signedUrl;
      } catch (err) {
            console.error("Failed to generate presigned URL:", err);
            return null; // Don't throw to prevent crashing the whole modal; just return null link
      }
};

module.exports = {
      uploadToS3,
      generatePresignedUrl,
      s3Client
};
