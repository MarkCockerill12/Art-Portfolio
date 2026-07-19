import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

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

const client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

async function calculateStorage() {
  try {
    let totalSizeBytes = 0;
    let objectCount = 0;
    let isTruncated = true;
    let continuationToken = undefined;

    while (isTruncated) {
      const command = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        ContinuationToken: continuationToken,
      });

      const response = await client.send(command);
      if (response.Contents) {
        response.Contents.forEach((item) => {
          totalSizeBytes += item.Size || 0;
          objectCount++;
        });
      }
      isTruncated = response.IsTruncated || false;
      continuationToken = response.NextContinuationToken;
    }

    const totalSizeMB = totalSizeBytes / (1024 * 1024);
    const totalSizeGB = totalSizeBytes / (1024 * 1024 * 1024);
    const freeTierGB = 10; // Cloudflare R2 has 10GB free tier
    const percentUsed = (totalSizeGB / freeTierGB) * 100;
    const remainingGB = freeTierGB - totalSizeGB;

    console.log("=========================================");
    console.log(`📊 CLOUDFLARE R2 STORAGE STATISTICS`);
    console.log("=========================================");
    console.log(`🪣 Bucket Name:    ${R2_BUCKET_NAME}`);
    console.log(`📁 Total Objects:  ${objectCount}`);
    console.log(`💾 Total Storage:  ${totalSizeMB.toFixed(2)} MB (${totalSizeGB.toFixed(4)} GB)`);
    console.log(`🆓 Free Tier Limit: ${freeTierGB} GB`);
    console.log(`📈 Usage percent:  ${percentUsed.toFixed(4)}%`);
    console.log(`🔋 Remaining Free: ${remainingGB.toFixed(4)} GB`);
    console.log("=========================================");

  } catch (err) {
    console.error("❌ Failed to query R2 storage metrics", err);
  }
}

calculateStorage();
