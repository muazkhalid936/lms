"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  FileText,
  Eye,
} from "lucide-react";
import ProgressService from "@/lib/services/progressService";
import toast from "react-hot-toast";

const VideoCoursePlayer = () => {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmbeddedPdf, setShowEmbeddedPdf] = useState(false);
  const [hasStartedViewing, setHasStartedViewing] = useState(false);
  const [completionTimer, setCompletionTimer] = useState(null);
  const [useStreamingAPI, setUseStreamingAPI] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [url, setUrl] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchLessonAndCourse = async () => {
      if (!params.courseId || !params.lessonId) return;

      try {
        setLoading(true);

        const courseResponse = await fetch(`/api/courses/${params.courseId}`);
        const courseData = await courseResponse.json();

        if (courseData.success) {
          setCourse(courseData.data);

          let currentLesson = null;
          for (const chapter of courseData.data.chapters || []) {
            currentLesson = chapter.lessons?.find(
              (l) => l._id === params.lessonId
            );
            if (currentLesson) {
              setLesson({ ...currentLesson, chapterTitle: chapter.title });
              break;
            }
          }
          //console.log("Current Lesson:", currentLesson);
          console.log("Lesson content:", currentLesson?.content);
          setUrl(currentLesson?.content.videoUrl);

          if (!currentLesson) {
            setError("Lesson not found");
          }
        } else {
          setError(courseData.message || "Failed to fetch course");
        }
      } catch (err) {
        setError("An error occurred while fetching the lesson");
        console.error("Error fetching lesson:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonAndCourse();
  }, [params.courseId, params.lessonId]);

  // Auto-completion logic
  useEffect(() => {
    if (!lesson || !params.courseId || !params.lessonId) return;

    // Start completion timer when lesson is loaded
    const timer = setTimeout(async () => {
      try {
        const result = await ProgressService.markLessonComplete(
          params.courseId,
          params.lessonId
        );
        if (result.success) {
          toast.success("Lesson completed!");
        }
      } catch (error) {
        console.error("Error marking lesson complete:", error);
      }
    }, 10000); // Mark as complete after 10 seconds of viewing

    setCompletionTimer(timer);

    // Cleanup timer on unmount or lesson change
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [lesson, params.courseId, params.lessonId]);

  // Mark lesson as started when user interacts with video content
  const handleContentInteraction = () => {
    if (!hasStartedViewing) {
      setHasStartedViewing(true);
    }
  };

  const isYouTubeUrl = (url) => {
    return url?.includes("youtube.com") || url?.includes("youtu.be");
  };

  const getYouTubeEmbedUrl = (url) => {
    //console.log("Original URL:", url);
    if (!url) return "";

    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  // Extract S3 key from video URL and create streaming API URL
  const getStreamingUrl = (videoUrl) => {
    if (!videoUrl || isYouTubeUrl(videoUrl)) return videoUrl;

    try {
      let key = "";

      // Check if it's already an API file URL: /api/files/encoded-key
      if (videoUrl.startsWith("/api/files/")) {
        const encodedKey = videoUrl.replace("/api/files/", "");
        key = decodeURIComponent(encodedKey);
      }
      // Handle direct S3 URLs
      else if (
        videoUrl.includes(".amazonaws.com") ||
        videoUrl.includes("s3.")
      ) {
        const url = new URL(videoUrl);

        if (url.hostname.includes(".s3.") || url.hostname.includes(".s3-")) {
          // Format: https://bucket.s3.region.amazonaws.com/key
          key = url.pathname.substring(1); // Remove leading slash
        } else if (
          url.hostname.startsWith("s3.") ||
          url.hostname.startsWith("s3-")
        ) {
          // Format: https://s3.region.amazonaws.com/bucket/key
          const pathParts = url.pathname.substring(1).split("/");
          key = pathParts.slice(1).join("/"); // Remove bucket name, keep the rest as key
        }
      }
      // Handle presigned URLs or other formats
      else if (videoUrl.startsWith("http")) {
        const url = new URL(videoUrl);
        // Try to extract key from pathname
        key = url.pathname.substring(1);
      }

      if (!key) {
        console.warn("Could not extract S3 key from URL:", videoUrl);
        return videoUrl; // Fallback to original URL
      }

      console.log("Using streaming URL for key:", key);
      return `/api/video?key=${encodeURIComponent(key)}`;
    } catch (error) {
      console.error("Error parsing video URL:", error);
      return videoUrl; // Fallback to original URL
    }
  };

  const goBack = () => {
    router.back();
  };

  const findAdjacentLessons = () => {
    if (!course?.chapters || !lesson)
      return { prevLesson: null, nextLesson: null };

    let allLessons = [];
    course.chapters.forEach((chapter) => {
      if (chapter.lessons) {
        chapter.lessons.forEach((l) => {
          allLessons.push({ ...l, chapterTitle: chapter.title });
        });
      }
    });

    const currentIndex = allLessons.findIndex((l) => l._id === lesson._id);
    return {
      prevLesson: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      nextLesson:
        currentIndex < allLessons.length - 1
          ? allLessons[currentIndex + 1]
          : null,
    };
  };

  const { prevLesson, nextLesson } = findAdjacentLessons();

  const navigateToLesson = (targetLesson) => {
    if (targetLesson) {
      router.push(
        `/dashboard/student/courses/${params.courseId}/lesson/${targetLesson._id}`
      );
    }
  };

  if (loading) {
    return (
      <div className="mx-auto p-6 bg-white flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">Loading lesson...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto p-6 bg-white">
        <div className="text-red-500 text-center">Error: {error}</div>
      </div>
    );
  }

  // Get the appropriate video URL based on lesson type
  const videoUrl = lesson?.content?.youtubeUrl || lesson?.content?.videoUrl;
  const documentUrl = lesson?.content?.documentUrl;
  const isYouTube = isYouTubeUrl(videoUrl);

  const streamingUrl = lesson?.content?.videoKey
    ? `/api/video?key=${encodeURIComponent(lesson.content.videoKey)}`
    : getStreamingUrl(videoUrl);

  // Function to handle video errors and fallback
  const handleVideoError = (error) => {
    setVideoError(error);

    if (useStreamingAPI) {
      console.log("Streaming API failed, falling back to original URL");
      setUseStreamingAPI(false);
      toast.error("Switching to direct video URL due to streaming issues");
    } else {
      toast.error("Video failed to load");
    }
  };

  // Function to handle successful video load
  const handleVideoLoad = () => {
    console.log("Video loaded successfully");
    setVideoError(null);
  };

  // Determine final video source
  const getFinalVideoSrc = () => {
    if (!videoUrl || isYouTube) return videoUrl;

    if (useStreamingAPI) {
      if (lesson?.content?.videoKey) {
        // Try full file first for better metadata access, then fallback to streaming
        return `/api/video?key=${encodeURIComponent(
          lesson.content.videoKey
        )}&full=true`;
      } else {
        return getStreamingUrl(videoUrl);
      }
    } else {
      // Fallback to original URL
      return videoUrl;
    }
  };

  // Handle download functionality
  const handleDownload = async () => {
    if (documentUrl) {
      try {
        const response = await fetch(documentUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = lesson?.content?.documentName || `${lesson?.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Download failed:", error);
      }
    }
  };

  return (
    <div className="mx-auto p-6 md:pt-0 bg-white">
      <button
        onClick={goBack}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Course
      </button>

      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl mb-6">
        {lesson?.type === "document" && documentUrl ? (
          showEmbeddedPdf ? (
            <div
              className="w-full aspect-video bg-white"
              onClick={handleContentInteraction}
            >
              <iframe
                src={`${documentUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                title={lesson?.title}
                className="w-full h-full"
                frameBorder="0"
                onLoad={handleContentInteraction}
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setShowEmbeddedPdf(false)}
                  className="bg-gray-800 bg-opacity-75 text-white px-3 py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm"
                >
                  Back to Preview
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-green-600 bg-opacity-90 text-white px-3 py-2 rounded-lg hover:bg-opacity-100 transition-colors text-sm flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          ) : (
            <div
              className="w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-300"
              onClick={handleContentInteraction}
            >
              <div className="h-full flex flex-col items-center justify-center p-8">
                <div className="bg-red-100 rounded-full p-4 mb-4">
                  <FileText className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {lesson?.content?.documentName || lesson?.title}
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  Document lesson - {lesson?.content?.documentType || "PDF"}
                  {lesson?.content?.documentSize && (
                    <span className="block text-sm text-gray-500 mt-1">
                      Size:{" "}
                      {(lesson.content.documentSize / (1024 * 1024)).toFixed(2)}{" "}
                      MB
                    </span>
                  )}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowEmbeddedPdf(true)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                    View Embedded
                  </button>
                  <button
                    onClick={() => window.open(documentUrl, "_blank")}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                    Open in New Tab
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          )
        ) : lesson?.type === "text" ? (
          <div
            className="w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-300"
            onClick={handleContentInteraction}
          >
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center text-gray-600 max-w-2xl">
                <div className="bg-blue-100 rounded-full p-4 mb-4 mx-auto w-fit">
                  <FileText className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Text Lesson
                </h3>
                <div
                  className="text-left bg-white p-6 rounded-lg shadow-sm border text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      lesson?.content?.textContent || "No content available",
                  }}
                />
              </div>
            </div>
          </div>
        ) : !videoUrl ? (
          <div className="w-full aspect-video flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-500">
              <p className="text-lg">No video available for this lesson</p>
              <p className="text-sm mt-2">Lesson type: {lesson?.type}</p>
            </div>
          </div>
        ) : isYouTube ? (
          <iframe
            src={getYouTubeEmbedUrl(videoUrl)}
            title={lesson?.title}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleContentInteraction}
          />
        ) : (
          <div className="relative">
            {videoError && !useStreamingAPI && (
              <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                Using fallback video URL
              </div>
            )}
            {/* <video
              ref={videoRef}
              controls
              preload="metadata"
              key={useStreamingAPI ? "streaming" : "fallback"} // Force re-render on fallback
              src={url}
              className="w-full aspect-video object-contain"
              poster={course?.thumbnail?.url}
              onPlay={handleContentInteraction}
              onTimeUpdate={handleContentInteraction}
              onLoadStart={() => console.log("Video load started")}
              onCanPlay={() => {
                console.log("Video can play");
                handleVideoLoad();
              }}
              onLoadedMetadata={() => console.log("Video metadata loaded")}
              onError={(e) => {
                console.error("Video error:", e);
                handleVideoError(e);
              }}
              onStalled={() => console.log("Video stalled")}
              onWaiting={() => console.log("Video waiting")}
              style={{ background: "black" }}
            >
              Your browser does not support the video tag.
            </video> */}
            <video
              className="w-full aspect-video object-contain"
              poster={course?.thumbnail?.url}
              controls
              src={`${url}`}
            >
              asd
            </video>
          </div>
        )}
      </div>

      {/* Auto-completion notification */}
      {/* {hasStartedViewing && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            🎯 This lesson will be automatically marked as complete after viewing for 10 seconds.
          </p>
        </div>
      )} */}

      <div className="mb-8">
        <div className="text-sm text-gray-500 mb-2">{lesson?.chapterTitle}</div>
        <h1 className="text-[20px] font-bold text-gray-900 mb-4">
          {lesson?.title}
        </h1>
        {lesson?.description && (
          <div
            dangerouslySetInnerHTML={{ __html: lesson.description }}
            className="text-gray-600 text-[15px] leading-relaxed mb-4"
          />
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          <span>
            Duration: {lesson?.duration?.minutes || 0}:
            {(lesson?.duration?.seconds || 0).toString().padStart(2, "0")}
          </span>
          <span>Type: {lesson?.type || "Video"}</span>
          {lesson?.isFree && (
            <span className="text-green-600">Free Preview</span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center gap-4">
        <button
          onClick={() => navigateToLesson(prevLesson)}
          disabled={!prevLesson}
          className={`cursor-pointer flex border rounded-[100px] border-[var(--gray-600-10)] bg-[var(--gray-600-10)] items-center px-4 py-3 transition-colors ${
            prevLesson
              ? "text-gray-600 hover:text-gray-800"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          <span>Previous Lesson</span>
        </button>

        <button
          onClick={() => navigateToLesson(nextLesson)}
          disabled={!nextLesson}
          className={`cursor-pointer flex items-center rounded-[100px] px-6 py-3 transition-colors ${
            nextLesson
              ? "bg-[var(--rose-500)] hover:bg-red-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next Lesson
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default VideoCoursePlayer;
