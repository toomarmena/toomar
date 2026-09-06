import "server-only";
import { DeleteObjectCommand, DeleteObjectsCommand, PutBucketCorsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const R2_BUCKET = process.env.R2_BUCKET || "toomar";

/** Objects are immutable (every upload gets a fresh key), so they can be cached for a year. */
export const CACHE_CONTROL = "public, max-age=31536000, immutable";

let client: S3Client | null = null;

function r2() {
  if (client) return client;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 keys are missing: set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY");
  }
  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

/** A URL the browser can PUT to directly, valid for ten minutes. */
export async function presignUpload(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
    CacheControl: CACHE_CONTROL,
  });
  const url = await getSignedUrl(r2(), command, { expiresIn: 600 });
  return { url, key, headers: { "Content-Type": contentType, "Cache-Control": CACHE_CONTROL } };
}

export async function deleteObject(key: string) {
  await r2().send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

export async function deleteObjects(keys: string[]) {
  if (keys.length === 0) return;
  await r2().send(new DeleteObjectsCommand({ Bucket: R2_BUCKET, Delete: { Objects: keys.map((Key) => ({ Key })) } }));
}

/** Lets browsers on our origins upload straight to the bucket. Run once from the editor's desk. */
export async function configureCors(origins: string[]) {
  await r2().send(
    new PutBucketCorsCommand({
      Bucket: R2_BUCKET,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: origins,
            AllowedMethods: ["PUT", "GET", "HEAD"],
            AllowedHeaders: ["Content-Type", "Cache-Control"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 86400,
          },
        ],
      },
    }),
  );
}
