import { S3Client, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Handle OPTIONS requests for CORS
export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type, Accept-Encoding",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// Handle HEAD requests for video metadata
export async function HEAD(req) {
  try {
    const { searchParams } = new URL(req.url);
    const videoKey = searchParams.get('key');

    if (!videoKey) {
      return new Response("Video key is required", { status: 400 });
    }

    const head = await s3.send(new HeadObjectCommand({
      Bucket: process.env.AWS_UPLOAD_BUCKET,
      Key: videoKey,
    }));

    const headers = {
      "Accept-Ranges": "bytes",
      "Content-Length": Number(head.ContentLength),
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type, Accept-Encoding",
    };

    return new Response(null, { status: 200, headers });
  } catch (error) {
    console.error("Video HEAD error:", error);
    return new Response("Video not found", { status: 404 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const videoKey = searchParams.get('key');
    const forceFullFile = searchParams.get('full') === 'true';
    const range = req.headers.get("range");

    if (!videoKey) {
      return new Response("Video key is required", { status: 400 });
    }

    // Check if file exists and get its size
    let fileSize;
    try {
      const head = await s3.send(new HeadObjectCommand({
        Bucket: process.env.AWS_UPLOAD_BUCKET,
        Key: videoKey,
      }));
      fileSize = Number(head.ContentLength);
    } catch (error) {
      console.error("File not found or access denied:", error);
      return new Response("Video not found", { status: 404 });
    }

    // Force full file serving if requested or for problematic files
    if (forceFullFile || (fileSize < 50 * 10 ** 6 && !range)) {
      console.log(`Video: Serving entire file (${fileSize} bytes)`);
      
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_UPLOAD_BUCKET,
        Key: videoKey,
      });

      const data = await s3.send(command);
      const stream = data.Body;

      const headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type, Accept-Encoding",
      };

      return new Response(stream, { status: 200, headers });
    }

    // Handle range requests for video streaming
    if (range) {
      const matches = range.match(/bytes=(\d+)-(\d*)/);
      if (!matches) {
        return new Response("Invalid range format", { status: 400 });
      }
      
      const start = parseInt(matches[1], 10);
      let end;
      
      if (matches[2]) {
        end = parseInt(matches[2], 10);
      } else {
        // For files with metadata at the end, we need to be more aggressive with initial chunk
        if (start === 0 && fileSize < 100 * 10 ** 6) {
          // For files under 100MB, serve the entire file on first request
          // This ensures metadata is available for playback
          end = fileSize - 1;
          console.log(`Video: Serving entire file for metadata access (${fileSize} bytes)`);
        } else if (start === 0) {
          // For larger files, serve a bigger initial chunk
          end = Math.min(20 * 10 ** 6 - 1, fileSize - 1);
          console.log(`Video: Serving large initial chunk for metadata (${end - start + 1} bytes)`);
        } else {
          // Subsequent requests - use 5MB chunks
          end = Math.min(start + 5 * 10 ** 6 - 1, fileSize - 1);
        }
      }

      console.log(`Video range request: ${start}-${end} of ${fileSize}`);

      const command = new GetObjectCommand({
        Bucket: process.env.AWS_UPLOAD_BUCKET,
        Key: videoKey,
        Range: `bytes=${start}-${end}`,
      });

      const data = await s3.send(command);
      const stream = data.Body;

      const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type, Accept-Encoding",
      };

      return new Response(stream, { status: 206, headers });
    } else {
      // Handle non-range requests (serve entire file)
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_UPLOAD_BUCKET,
        Key: videoKey,
      });

      const data = await s3.send(command);
      const stream = data.Body;

      const headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=86400", // Cache for 1 day
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Resource-Policy": "cross-origin",
      };

      return new Response(stream, { status: 200, headers });
    }
  } catch (error) {
    console.error("Video streaming error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}