const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
dotenv.config();

const REGION = process.env.S3_REGION || 'auto';
const ENDPOINT = process.env.S3_ENDPOINT;
const BUCKET = process.env.S3_BUCKET_NAME;

const s3Client = new S3Client({
      region: REGION,
      endpoint: ENDPOINT,
      credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
      }
});

async function clearBucket() {
      try {
            console.log(`Fetching objects from bucket: ${BUCKET}...`);
            let isTruncated = true;
            let continuationToken = undefined;

            let totalDeleted = 0;

            while (isTruncated) {
                  const listParams = {
                        Bucket: BUCKET,
                        ContinuationToken: continuationToken,
                  };

                  const listResponse = await s3Client.send(new ListObjectsV2Command(listParams));

                  if (!listResponse.Contents || listResponse.Contents.length === 0) {
                        console.log('Bucket is already empty.');
                        break;
                  }

                  const objectsToDelete = listResponse.Contents.map((obj) => ({ Key: obj.Key }));

                  const deleteParams = {
                        Bucket: BUCKET,
                        Delete: {
                              Objects: objectsToDelete,
                              Quiet: true,
                        },
                  };

                  const deleteResponse = await s3Client.send(new DeleteObjectsCommand(deleteParams));
                  totalDeleted += objectsToDelete.length;
                  console.log(`Deleted ${objectsToDelete.length} objects. Total deleted so far: ${totalDeleted}`);

                  isTruncated = listResponse.IsTruncated;
                  continuationToken = listResponse.NextContinuationToken;
            }

            console.log(`Successfully cleared bucket. Total objects deleted: ${totalDeleted}`);
      } catch (error) {
            console.error('Error clearing bucket:', error);
      }
}

clearBucket();
