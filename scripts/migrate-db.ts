import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { myArtwork, secretArtwork } from "../lib/my-artwork";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ Error: .env.local file not found.");
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = value;
    }
  });
}

loadEnv();

const { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET_NAME } = process.env;

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT || !R2_BUCKET_NAME) {
  console.error("❌ Error: Missing credentials in .env.local.");
  process.exit(1);
}

console.log("⚙️ Initializing R2 S3 Client...");
const client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function runMigration() {
  try {
    console.log(`📦 Merging static artworks from "lib/my-artwork.ts"...`);
    console.log(`  • Gallery items: ${myArtwork.length}`);
    console.log(`  • Secret items:  ${secretArtwork.length}`);

    const payload = {
      myArtwork,
      secretArtwork,
    };

    const jsonString = JSON.stringify(payload, null, 2);

    console.log(`📤 Uploading "artworks.json" to R2 bucket "${R2_BUCKET_NAME}"...`);
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: "artworks.json",
      Body: jsonString,
      ContentType: "application/json",
      CacheControl: "no-cache, no-store, must-revalidate",
    });

    await client.send(command);
    console.log("✅ Database Migration Successful! artworks.json is now live on Cloudflare R2.");
  } catch (err) {
    console.error("❌ Migration Failed!");
    console.error(err);
  }
}

runMigration();
