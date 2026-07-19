import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { myArtwork as staticMyArtwork, secretArtwork as staticSecretArtwork } from "./my-artwork";
import { Artwork } from "./types";

const hasR2Credentials =
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_ENDPOINT &&
  process.env.R2_BUCKET_NAME;

export const s3Client = hasR2Credentials
  ? new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    })
  : null;

export async function getArtworksList(): Promise<{ myArtwork: Artwork[]; secretArtwork: Artwork[] }> {
  if (!process.env.R2_PUBLIC_URL) {
    return { myArtwork: staticMyArtwork, secretArtwork: staticSecretArtwork };
  }

  const url = `${process.env.R2_PUBLIC_URL}/artworks.json`;
  try {
    const res = await fetch(url, { cache: "no-store" }); // Avoid caching database state on API calls
    if (res.ok) {
      const data = await res.json();
      return {
        myArtwork: data.myArtwork || [],
        secretArtwork: data.secretArtwork || [],
      };
    }
  } catch (error) {
    console.error("Error fetching artworks.json from R2, using static list:", error);
  }

  return { myArtwork: staticMyArtwork, secretArtwork: staticSecretArtwork };
}

export async function saveArtworksList(artworks: {
  myArtwork: Artwork[];
  secretArtwork: Artwork[];
}): Promise<boolean> {
  if (!s3Client || !process.env.R2_BUCKET_NAME) {
    console.error("R2 credentials not configured, cannot save database");
    return false;
  }

  try {
    const jsonString = JSON.stringify(artworks, null, 2);
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: "artworks.json",
      Body: jsonString,
      ContentType: "application/json",
      CacheControl: "no-cache, no-store, must-revalidate",
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Failed to upload artworks.json to R2:", error);
    return false;
  }
}

export async function uploadMediaToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string | null> {
  if (!s3Client || !process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_URL) {
    console.error("R2 credentials not configured, cannot upload media");
    return null;
  }

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000",
    });

    await s3Client.send(command);
    return `${process.env.R2_PUBLIC_URL}/${fileName}`;
  } catch (error) {
    console.error(`Failed to upload ${fileName} to R2:`, error);
    return null;
  }
}
