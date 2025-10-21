import { NextResponse } from "next/server";

// Function to extract YouTube video ID from URL
function extractYouTubeVideoId(url) {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Function to parse ISO 8601 duration to seconds
function parseISO8601Duration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Function to format seconds to HH:MM:SS
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export async function POST(request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeVideoId(url);
    
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    try {
      // Method 1: Try using YouTube oEmbed API (doesn't provide duration but validates URL)
      const oEmbedResponse = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      
      if (!oEmbedResponse.ok) {
        return NextResponse.json(
          { success: false, error: "Video not found or private" },
          { status: 404 }
        );
      }

      const oEmbedData = await oEmbedResponse.json();

      // Method 2: Try noembed.com as a fallback (sometimes provides duration)
      try {
        const noembedResponse = await fetch(
          `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
        );
        
        if (noembedResponse.ok) {
          const noembedData = await noembedResponse.json();
          if (noembedData.duration) {
            return NextResponse.json({
              success: true,
              duration: formatDuration(noembedData.duration),
              title: oEmbedData.title,
              videoId: videoId
            });
          }
        }
      } catch (error) {
        console.log("Noembed failed, trying alternative method");
      }

      // Method 3: Try to extract duration from video page HTML (may be blocked by CORS)
      try {
        const videoPageResponse = await fetch(
          `https://www.youtube.com/watch?v=${videoId}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        );

        if (videoPageResponse.ok) {
          const html = await videoPageResponse.text();
          
          // Try to extract duration from various possible locations in the HTML
          const durationRegexes = [
            /"lengthSeconds":"(\d+)"/,
            /"duration":"PT(\d+H)?(\d+M)?(\d+S)?"/,
            /contentDuration":"PT(\d+H)?(\d+M)?(\d+S)?"/
          ];

          for (const regex of durationRegexes) {
            const match = html.match(regex);
            if (match) {
              if (match[0].includes('lengthSeconds')) {
                const seconds = parseInt(match[1]);
                return NextResponse.json({
                  success: true,
                  duration: formatDuration(seconds),
                  title: oEmbedData.title,
                  videoId: videoId
                });
              } else if (match[0].includes('PT')) {
                const durationString = match[0].match(/"PT[^"]+"/)[0].replace(/"/g, '');
                const seconds = parseISO8601Duration(durationString);
                return NextResponse.json({
                  success: true,
                  duration: formatDuration(seconds),
                  title: oEmbedData.title,
                  videoId: videoId
                });
              }
            }
          }
        }
      } catch (error) {
        console.log("HTML parsing failed");
      }

      // If all methods fail, return basic video info without duration
      return NextResponse.json({
        success: true,
        duration: "00:00:00",
        title: oEmbedData.title,
        videoId: videoId,
        message: "Duration could not be automatically fetched. Please enter manually."
      });

    } catch (error) {
      console.error("Error fetching video info:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch video information" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}