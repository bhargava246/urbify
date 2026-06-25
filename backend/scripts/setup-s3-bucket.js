/**
 * One-off helper: creates a fresh S3 bucket in the region your backend is
 * already configured for (AWS_REGION in .env), makes it publicly readable
 * (required because uploads.service.ts builds plain https:// URLs, not
 * presigned ones), and rewrites AWS_S3_BUCKET_NAME in backend/.env.
 *
 * Run from the backend/ folder:
 *   node scripts/setup-s3-bucket.js
 *
 * Requires the IAM user in .env to have s3:CreateBucket, s3:PutBucketPolicy,
 * and s3:PutPublicAccessBlock permissions (you mentioned it has full access).
 */
const fs = require('fs');
const path = require('path');
const {
  S3Client,
  CreateBucketCommand,
  PutPublicAccessBlockCommand,
  PutBucketPolicyCommand,
} = require('@aws-sdk/client-s3');

const ENV_PATH = path.join(__dirname, '..', '.env');

function loadEnv() {
  const raw = fs.readFileSync(ENV_PATH, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
  return { raw, env };
}

function updateEnvBucketName(raw, newBucket) {
  if (/^AWS_S3_BUCKET_NAME=.*/m.test(raw)) {
    return raw.replace(/^AWS_S3_BUCKET_NAME=.*/m, `AWS_S3_BUCKET_NAME=${newBucket}`);
  }
  return raw.trim() + `\nAWS_S3_BUCKET_NAME=${newBucket}\n`;
}

async function main() {
  const { raw, env } = loadEnv();
  const region = env.AWS_REGION || 'ap-south-1';
  const accessKeyId = env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    console.error('Missing AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY in backend/.env');
    process.exit(1);
  }

  const bucketName = `urbify-listings-${Date.now().toString(36)}`;
  const s3 = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });

  console.log(`Creating bucket "${bucketName}" in ${region}...`);
  try {
    await s3.send(
      new CreateBucketCommand({
        Bucket: bucketName,
        ...(region !== 'us-east-1'
          ? { CreateBucketConfiguration: { LocationConstraint: region } }
          : {}),
      }),
    );
  } catch (err) {
    console.error('CreateBucket failed:', err.message);
    process.exit(1);
  }

  console.log('Disabling public-access-block (so the policy below can apply)...');
  await s3.send(
    new PutPublicAccessBlockCommand({
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false,
      },
    }),
  );

  console.log('Applying public-read bucket policy (object GetObject only)...');
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${bucketName}/*`,
      },
    ],
  };
  // Public access block takes a moment to propagate; retry briefly.
  let lastErr;
  for (let i = 0; i < 5; i++) {
    try {
      await s3.send(
        new PutBucketPolicyCommand({ Bucket: bucketName, Policy: JSON.stringify(policy) }),
      );
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  if (lastErr) {
    console.warn('Could not apply bucket policy automatically:', lastErr.message);
    console.warn('You may need to set it manually in the AWS console.');
  }

  const updated = updateEnvBucketName(raw, bucketName);
  fs.writeFileSync(ENV_PATH, updated);

  console.log('\nDone.');
  console.log(`Bucket:  ${bucketName}`);
  console.log(`Region:  ${region}`);
  console.log('backend/.env updated with the new AWS_S3_BUCKET_NAME.');
  console.log('\nRestart your backend dev server now so it picks up the new bucket.');
}

main();
