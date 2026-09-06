/**
 * Lets browsers on our origins upload straight to the R2 bucket.
 *   node scripts/r2-cors.mjs
 * The editor's desk has the same button; this is for running it from a terminal.
 */
import { readFileSync } from "node:fs";
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const bucket = process.env.R2_BUCKET || "toomar";
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const origins = ["https://toomar.vercel.app", "https://toomar-toomar.vercel.app", "http://localhost:3000", "http://localhost:3210"];
await s3.send(
  new PutBucketCorsCommand({
    Bucket: bucket,
    CORSConfiguration: {
      CORSRules: [{ AllowedOrigins: origins, AllowedMethods: ["PUT", "GET", "HEAD"], AllowedHeaders: ["Content-Type", "Cache-Control"], ExposeHeaders: ["ETag"], MaxAgeSeconds: 86400 }],
    },
  }),
);
const { CORSRules } = await s3.send(new GetBucketCorsCommand({ Bucket: bucket }));
console.log("CORS set on", bucket, "for", CORSRules[0].AllowedOrigins.join(", "));
