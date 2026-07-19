import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getArtworksList, saveArtworksList, uploadMediaToR2 } from "@/lib/r2";
import { Artwork } from "@/lib/types";

export async function GET() {
  try {
    const list = await getArtworksList();
    return NextResponse.json(list);
  } catch (error) {
    console.error("GET artworks error:", error);
    return NextResponse.json({ error: "Failed to fetch artworks list" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // 1. Verify Authentication
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (session !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const software = formData.get("software") as any;
    const genre = formData.get("genre") as any;
    const isDigital = formData.get("isDigital") === "true";
    const isFavorite = formData.get("isFavorite") === "true";
    const isCollab = formData.get("isCollab") === "true";
    const isSecret = formData.get("isSecret") === "true";
    const timeTaken = formData.get("timeTaken") as string;

    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "Media file is required" }, { status: 400 });
    }

    const timestamp = Date.now();
    const baseName = sanitizeFilename(title || "untitled") + "-" + timestamp;

    let imageUrl = "";
    let thumbnailUrl = "";
    let videoUrl = "";

    const fileType = file.type;

    if (fileType.startsWith("video/")) {
      // It's a video!
      const videoBuffer = Buffer.from(await file.arrayBuffer());
      const videoExtension = file.name.split(".").pop() || "mp4";
      const videoKey = `art-portfolio/art/full-size/${baseName}.${videoExtension}`;

      // Upload raw video
      const uploadedVideoUrl = await uploadMediaToR2(videoBuffer, videoKey, fileType);
      if (!uploadedVideoUrl) {
        return NextResponse.json({ error: "Failed to upload video to R2" }, { status: 500 });
      }
      videoUrl = uploadedVideoUrl;

      // Extract frame preview (sent by client as previewFile)
      const previewFile = formData.get("previewFile") as File;
      if (previewFile) {
        const previewBuffer = Buffer.from(await previewFile.arrayBuffer());
        const previewKey = `art-portfolio/art/full-size/${baseName}-preview.webp`;
        const uploadedPreviewUrl = await uploadMediaToR2(previewBuffer, previewKey, "image/webp");
        imageUrl = uploadedPreviewUrl || "";
      }

      // Thumbnail (sent by client as thumbnailFile)
      const thumbnailFile = formData.get("thumbnailFile") as File;
      if (thumbnailFile) {
        const thumbBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
        const thumbKey = `art-portfolio/art/thumbnails/${baseName}-preview_thumb.webp`;
        const uploadedThumbUrl = await uploadMediaToR2(thumbBuffer, thumbKey, "image/webp");
        thumbnailUrl = uploadedThumbUrl || "";
      }
    } else {
      // It's an image! (Pre-converted to WebP by client)
      const imageBuffer = Buffer.from(await file.arrayBuffer());
      const mainKey = `art-portfolio/art/full-size/${baseName}.webp`;
      const uploadedMainUrl = await uploadMediaToR2(imageBuffer, mainKey, "image/webp");
      if (!uploadedMainUrl) {
        return NextResponse.json({ error: "Failed to upload image to R2" }, { status: 500 });
      }
      imageUrl = uploadedMainUrl;

      // Thumbnail (sent by client as thumbnailFile)
      const thumbnailFile = formData.get("thumbnailFile") as File;
      if (thumbnailFile) {
        const thumbBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
        const thumbKey = `art-portfolio/art/thumbnails/${baseName}_thumb.webp`;
        const uploadedThumbUrl = await uploadMediaToR2(thumbBuffer, thumbKey, "image/webp");
        thumbnailUrl = uploadedThumbUrl || "";
      }
    }

    // Load current DB
    const db = await getArtworksList();

    // Create new artwork item
    const newArtwork: Artwork = {
      id: String(timestamp),
      title,
      image: imageUrl,
      thumbnail: thumbnailUrl || undefined,
      videoUrl: videoUrl || undefined,
      description,
      date,
      software: software || undefined,
      genre: genre || undefined,
      isDigital,
      isFavorite,
      isCollab,
      timeTaken: timeTaken || undefined,
    };

    if (isSecret) {
      db.secretArtwork.push(newArtwork);
    } else {
      db.myArtwork.push(newArtwork);
    }

    // Save updated DB to R2
    const success = await saveArtworksList(db);
    if (!success) {
      return NextResponse.json({ error: "Failed to save updated database to R2" }, { status: 500 });
    }

    return NextResponse.json({ success: true, artwork: newArtwork });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: error.message || "Failed to create post" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (session !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { updatedArtwork } = await request.json();
    if (!updatedArtwork || !updatedArtwork.id) {
      return NextResponse.json({ error: "Invalid artwork data" }, { status: 400 });
    }

    const db = await getArtworksList();

    // Remove from both lists first to avoid duplicates
    db.myArtwork = db.myArtwork.filter((art) => art.id !== updatedArtwork.id);
    db.secretArtwork = db.secretArtwork.filter((art) => art.id !== updatedArtwork.id);

    // Determine target list based on updated flags
    const isSecret = updatedArtwork.isSecret === true;

    if (isSecret) {
      db.secretArtwork.push(updatedArtwork);
    } else {
      db.myArtwork.push(updatedArtwork);
    }

    const success = await saveArtworksList(db);
    if (!success) {
      return NextResponse.json({ error: "Failed to save updated database to R2" }, { status: 500 });
    }

    return NextResponse.json({ success: true, artwork: updatedArtwork });
  } catch (error: any) {
    console.error("Error updating artwork:", error);
    return NextResponse.json({ error: error.message || "Failed to update artwork" }, { status: 500 });
  }
}

function sanitizeFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
