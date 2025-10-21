import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  Trash2,
  Play,
  Video,
  Youtube,
  Upload,
  FileText,
  HelpCircle,
  GripVertical,
  Calendar,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useCourse } from "@/contexts/CourseContext";
import { useMultipartUpload } from "@/hooks/useMultipartUpload";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const CurriculumComponent = ({ onNext }) => {
  const {
    currentCourse,
    chapters,
    isLoading,
    createChapter,
    updateChapter,
    deleteChapter,
    createLesson,
    deleteLesson,
    reorderLessons,
    fetchChapters,
    createQuiz,
    updateQuiz,
    deleteQuiz,
  } = useCourse();

  console.log("chapters", chapters);

  const [expandedSections, setExpandedSections] = useState({});
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showLectureTypeModal, setShowLectureTypeModal] = useState(false);
  const [showLectureFormModal, setShowLectureFormModal] = useState(false);
  const [showQuizFormModal, setShowQuizFormModal] = useState(false);
  const [showLiveClassFormModal, setShowLiveClassFormModal] = useState(false);
  const [selectedLectureType, setSelectedLectureType] = useState(null);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [editingLectureId, setEditingLectureId] = useState(null);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [sectionName, setSectionName] = useState("");
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isExtractingDuration, setIsExtractingDuration] = useState(false);

  // Multipart upload hook for large files
  const { uploadLargeFile, isUploading: isMultipartUploading, uploadProgress, error: uploadError, resetUpload } = useMultipartUpload();

  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureDuration, setLectureDuration] = useState("00:00:00");
  const [lectureSummary, setLectureSummary] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [lectureText, setLectureText] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  const [addingSection, setAddingSection] = useState(false);

  // Live class form state
  const [liveClassTitle, setLiveClassTitle] = useState("");
  const [liveClassDescription, setLiveClassDescription] = useState("");
  const [liveClassScheduledDate, setLiveClassScheduledDate] = useState("");
  const [liveClassDuration, setLiveClassDuration] = useState(60);
  const [liveClassMaxParticipants, setLiveClassMaxParticipants] = useState(100);

  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizPassingMarks, setQuizPassingMarks] = useState(60);
  const [quizTimeLimit, setQuizTimeLimit] = useState({
    hours: 0,
    minutes: 30,
    seconds: 0,
  });
  const [quizInstructions, setQuizInstructions] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([
    {
      question: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      points: 1,
    },
  ]);
  const [quizAllowRetake, setQuizAllowRetake] = useState(true);
  const [quizMaxAttempts, setQuizMaxAttempts] = useState(3);
  const [quizShuffleQuestions, setQuizShuffleQuestions] = useState(false);
  const [quizShuffleOptions, setQuizShuffleOptions] = useState(false);
  const [quizShowResults, setQuizShowResults] = useState(true);
  const [quizShowCorrectAnswers, setQuizShowCorrectAnswers] = useState(true);
  const [quizIsFree, setQuizIsFree] = useState(false);
  // Add these state variables at the top of your component
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (currentCourse && currentCourse._id) {
      fetchChapters(currentCourse._id);
    }
  }, [currentCourse?._id, fetchChapters]);

  const lectureTypes = [
    { id: "prerecorded", label: "Pre Recorded Video", icon: Video },
    { id: "youtube", label: "Youtube Video", icon: Youtube },
    { id: "document", label: "Upload Document", icon: Upload },
    { id: "quiz", label: "Quiz", icon: HelpCircle },
    { id: "live-class", label: "Live Class", icon: Calendar },
  ];

  const SortableLectureItem = ({ lecture, sectionId, onEdit, onDelete }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: lecture._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="m-4 rounded-[6px] flex items-center justify-between border border-[var(--gray-100)] px-6 py-3 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical size={16} className="text-gray-400" />
          </div>
          <div className="bg-[var(--green-500)] p-1.5 rounded-full flex items-center justify-center">
            {lecture.type === "document" ? (
              <FileText size={14} className="text-white fill-white" />
            ) : lecture.type === "quiz" ? (
              <HelpCircle size={14} className="text-white fill-white" />
            ) : lecture.type === "live-class" ? (
              <Calendar size={14} className="text-white fill-white" />
            ) : (
              <Play size={10} className="text-white fill-white" />
            )}
          </div>
          <span
            className={`${
              lecture.isPublished ? "text-gray-900" : "text-gray-700"
            }`}
          >
            {lecture.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(sectionId, lecture);
            }}
          >
            <Edit size={16} className="text-gray-500" />
          </button>
          <button
            className="p-2 hover:bg-red-100 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(sectionId, lecture._id);
            }}
          >
            <Trash2 size={16} className="text-[var(--rose-500)]" />
          </button>
        </div>
      </div>
    );
  };

  const handleGenerateWithAI = () => {
    const hasVideoLessons = chapters?.some((chapter) =>
      chapter.lessons?.some(
        (lesson) => lesson.type === "video" && lesson.content?.videoKey
      )
    );

    if (!hasVideoLessons) {
      alert(
        "No video lessons available for quiz generation. Please add video lessons first."
      );
      return;
    }

    // Directly generate quiz for all videos without showing selector
    confirmVideoSelection();
  };

  // Add these state variables at the top of your component

  // Remove showVideoSelector and selectedVideoLesson states since we don't need them anymore

  const confirmVideoSelection = async () => {
    setIsGeneratingQuiz(true);

    try {
      // Get all video lessons from all chapters
      const allVideoLessons = chapters?.flatMap(
        (chapter) =>
          chapter.lessons?.filter(
            (lesson) => lesson.type === "video" && lesson.content?.videoKey
          ) || []
      );

      if (!allVideoLessons.length) {
        throw new Error("No video lessons found");
      }

      console.log(
        `Generating quiz for ${allVideoLessons.length} video lessons`
      );

      // For now, we'll use the first video for quiz generation
      // You can modify this to process multiple videos if needed
      const firstVideoLesson = allVideoLessons[0];

      // Fetch the video file using the videoKey from your files API
      const videoUrl = `/api/files/${encodeURIComponent(
        firstVideoLesson.content.videoKey
      )}`;

      // Create form data for the API request
      const formData = new FormData();

      // First, we need to get the video file as a blob
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        throw new Error("Failed to fetch video file");
      }

      const videoBlob = await videoResponse.blob();
      formData.append("video", videoBlob, `${firstVideoLesson.title}.mp4`);
      formData.append("sectionId", firstVideoLesson.chapter);
      formData.append("courseId", firstVideoLesson.course);

      // Call your AI quiz generation API
      const quizResponse = await fetch("/api/quiz-test", {
        method: "POST",
        body: formData,
      });

      if (!quizResponse.ok) {
        const errorData = await quizResponse.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      const result = await quizResponse.json();

      if (result.success) {
        // Populate the form with the generated quiz
        const generatedQuiz = result.quiz;
        setQuizTitle(generatedQuiz.title || `Course Quiz - All Lessons`);
        setQuizDescription(
          generatedQuiz.description ||
            `AI-generated quiz based on course video content`
        );
        setQuizPassingMarks(generatedQuiz.passingMarks || 60);
        setQuizMaxAttempts(generatedQuiz.maxAttempts || 3);
        setQuizTimeLimit(
          generatedQuiz.timeLimit || { hours: 0, minutes: 30, seconds: 0 }
        );
        setQuizInstructions(
          generatedQuiz.instructions ||
            "This quiz was automatically generated from the course video content."
        );
        setQuizAllowRetake(generatedQuiz.allowRetake ?? true);
        setQuizShuffleQuestions(generatedQuiz.shuffleQuestions ?? false);
        setQuizShuffleOptions(generatedQuiz.shuffleOptions ?? false);
        setQuizShowResults(generatedQuiz.showResults ?? true);
        setQuizShowCorrectAnswers(generatedQuiz.showCorrectAnswers ?? true);
        setQuizIsFree(generatedQuiz.isFree ?? false);
        setQuizQuestions(generatedQuiz.questions || []);

        // Show success message
        alert(
          `Quiz generated successfully from ${allVideoLessons.length} video lessons! Please review the questions before saving.`
        );
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert(`Failed to generate quiz: ${error.message}`);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Don't forget to import Sparkles icon

  // Handle drag end for reordering lectures
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Find which section this drag operation belongs to
    let targetSection = null;
    let currentLessons = [];

    for (const section of chapters) {
      const lessonIds = section.lessons?.map((lesson) => lesson._id) || [];
      if (lessonIds.includes(active.id)) {
        targetSection = section;
        currentLessons = [...section.lessons];
        break;
      }
    }

    if (!targetSection) return;

    const oldIndex = currentLessons.findIndex(
      (lesson) => lesson._id === active.id
    );
    const newIndex = currentLessons.findIndex(
      (lesson) => lesson._id === over.id
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedLessons = arrayMove(currentLessons, oldIndex, newIndex);
      const lessonOrder = reorderedLessons.map((lesson) => lesson._id);

      // Call the reorder API
      await reorderLessons(currentCourse._id, targetSection._id, lessonOrder);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const addNewSection = () => {
    setShowAddSectionModal(true);
  };

  const handleAddSection = async () => {
    setAddingSection(true);
    if (sectionName.trim() && currentCourse?._id) {
      const chapterData = {
        title: sectionName.trim(),
        description: "",
        isFree: false,
      };

      const result = await createChapter(currentCourse._id, chapterData);
      if (result) {
        setSectionName("");
        setShowAddSectionModal(false);
        setAddingSection(false);
      }
    } else {
      toast.error("Please make sure course is created first");
    }
  };

  const handleCancelAddSection = () => {
    setSectionName("");
    setShowAddSectionModal(false);
  };

  const handleAddLectureClick = (sectionId) => {
    setCurrentSectionId(sectionId);
    setShowLectureTypeModal(true);
  };

  const handleLectureTypeSelect = (type) => {
    setSelectedLectureType(type);
    setShowLectureTypeModal(false);
    if (type === "quiz") {
      setShowQuizFormModal(true);
    } else if (type === "live-class") {
      setShowLiveClassFormModal(true);
    } else {
      setShowLectureFormModal(true);
    }
  };

  const handleCancelLectureType = () => {
    setShowLectureTypeModal(false);
    setCurrentSectionId(null);
    setSelectedLectureType(null);
  };

  const resetLectureForm = () => {
    setLectureTitle("");
    setLectureDuration("00:00:00");
    setLectureSummary("");
    setYoutubeUrl("");
    setLectureText("");
    setUploadedFile(null);
    setIsFileUploading(false);
    setIsExtractingDuration(false);
    setShowLectureFormModal(false);
    setSelectedLectureType(null);
    setCurrentSectionId(null);
  };

  const resetLiveClassForm = () => {
    setLiveClassTitle("");
    setLiveClassDescription("");
    setLiveClassScheduledDate("");
    setLiveClassDuration(60);
    setLiveClassMaxParticipants(100);
    setShowLiveClassFormModal(false);
    setSelectedLectureType(null);
    setCurrentSectionId(null);
  };

  const resetQuizForm = (clearAll = true) => {
    setQuizTitle("");
    setQuizDescription("");
    setQuizPassingMarks(60);
    setQuizTimeLimit({ hours: 0, minutes: 30, seconds: 0 });
    setQuizInstructions("");
    setQuizQuestions([
      {
        question: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        points: 1,
      },
    ]);
    setQuizAllowRetake(true);
    setQuizMaxAttempts(3);
    setQuizShuffleQuestions(false);
    setQuizShuffleOptions(false);
    setQuizShowResults(true);
    setQuizShowCorrectAnswers(true);
    setQuizIsFree(false);
    setShowQuizFormModal(false);
    setSelectedLectureType(null);

    // Only clear these if clearAll is true (not during successful edit)
    if (clearAll) {
      setCurrentSectionId(null);
      setEditingQuizId(null);
    }
  };

  const addQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        question: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        points: 1,
      },
    ]);
  };

  const removeQuestion = (questionIndex) => {
    if (quizQuestions.length > 1) {
      setQuizQuestions(
        quizQuestions.filter((_, index) => index !== questionIndex)
      );
    }
  };

  const updateQuestion = (questionIndex, field, value) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[questionIndex][field] = value;
    setQuizQuestions(updatedQuestions);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[questionIndex].options.push({
      text: "",
      isCorrect: false,
    });
    setQuizQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quizQuestions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      setQuizQuestions(updatedQuestions);
    }
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[questionIndex].options[optionIndex][field] = value;

    // If setting this option as correct, make others incorrect
    if (field === "isCorrect" && value) {
      updatedQuestions[questionIndex].options.forEach((option, index) => {
        if (index !== optionIndex) {
          option.isCorrect = false;
        }
      });
    }

    setQuizQuestions(updatedQuestions);
  };

  // Function to extract video duration
  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor(duration % 60);

        const formattedDuration = `${hours
          .toString()
          .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
        resolve(formattedDuration);
      };

      video.onerror = () => {
        resolve("00:00:00"); // fallback duration
      };

      video.src = URL.createObjectURL(file);
    });
  };

  // Function to fetch YouTube video duration
  const getYouTubeDuration = async (url) => {
    try {
      const response = await fetch("/api/youtube/duration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.message) {
          toast.warning(data.message);
        }
        return data.duration;
      } else {
        throw new Error(data.error || "Failed to fetch video duration");
      }
    } catch (error) {
      console.error("Error fetching YouTube duration:", error);
      toast.error("Could not fetch video duration. Please enter manually.");
      return "00:00:00";
    }
  };

  // Function to handle YouTube URL change and auto-fetch duration
  const handleYouTubeUrlChange = async (url) => {
    setYoutubeUrl(url);

    // Reset duration when URL is cleared
    if (!url.trim()) {
      setLectureDuration("00:00:00");
      return;
    }

    // Check if it's a valid YouTube URL
    if (
      url.trim() &&
      (url.includes("youtube.com") || url.includes("youtu.be"))
    ) {
      setIsExtractingDuration(true);
      try {
        const duration = await getYouTubeDuration(url);
        setLectureDuration(duration);
        if (duration !== "00:00:00") {
          toast.success("Video duration fetched successfully!");
        }
      } catch (error) {
        console.error("Error fetching duration:", error);
      } finally {
        setIsExtractingDuration(false);
      }
    } else if (
      url.trim() &&
      !url.includes("youtube.com") &&
      !url.includes("youtu.be")
    ) {
      // Show warning for non-YouTube URLs
      toast.error("Please enter a valid YouTube URL");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);

      // Auto-extract duration for prerecorded videos
      if (
        selectedLectureType === "prerecorded" &&
        file.type.startsWith("video/")
      ) {
        setIsExtractingDuration(true);
        try {
          const duration = await getVideoDuration(file);
          setLectureDuration(duration);
        } catch (error) {
          console.error("Failed to extract video duration:", error);
          // Keep default duration if extraction fails
        } finally {
          setIsExtractingDuration(false);
        }
      }
    }
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (
      showAddSectionModal ||
      showLectureTypeModal ||
      showLectureFormModal ||
      showQuizFormModal
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to reset on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [
    showAddSectionModal,
    showLectureTypeModal,
    showLectureFormModal,
    showQuizFormModal,
  ]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const handleAddLiveClass = async () => {
    setIsLiveLoading(true);
    if (
      liveClassTitle.trim() &&
      liveClassDescription.trim() &&
      liveClassScheduledDate &&
      currentCourse?._id &&
      currentSectionId
    ) {
      try {
        // Import apiCaller at the top of the file if not already imported
        const apiCaller = (await import("@/lib/utils/apiCaller")).default;

        // 1. Create standalone live class
        const liveClassData = {
          title: liveClassTitle.trim(),
          description: liveClassDescription.trim(),
          courseId: currentCourse._id,
          scheduledDate: liveClassScheduledDate,
          duration: liveClassDuration,
          maxParticipants: liveClassMaxParticipants,
          isRecordingEnabled: true,
          waitingRoomEnabled: true,
          isPublic: false,
        };

        const liveClassResponse = await apiCaller.post(
          "/api/live-classes",
          liveClassData
        );

        if (!liveClassResponse.success) {
          toast.error(
            liveClassResponse.message || "Failed to create live class"
          );
          return;
        }

        // 2. Create lesson in chapter with liveClass type
        const lessonData = {
          title: liveClassTitle.trim(),
          description: liveClassDescription.trim(),
          type: "liveClass",
          liveClassData: {
            scheduledDate: liveClassScheduledDate,
            scheduledTime: liveClassScheduledDate, // Using same date for time
            duration: liveClassDuration,
            maxParticipants: liveClassMaxParticipants,
            requiresRegistration: false,
            sendReminders: true,
            recordSession: true,
            liveClassId: liveClassResponse.data._id, // Link to the standalone live class
          },
        };

        const lessonResult = await createLesson(
          currentCourse._id,
          currentSectionId,
          lessonData
        );

        if (lessonResult) {
          resetLiveClassForm();
          toast.success("Live class created successfully!");
        }
      } catch (error) {
        console.error("Error creating live class:", error);
        toast.error(error.message || "Failed to create live class");
      } finally {
        setIsLiveLoading(false);
      }
    } else {
      if (!liveClassTitle.trim()) {
        toast.error("Live class title is required");
      } else if (!liveClassDescription.trim()) {
        toast.error("Live class description is required");
      } else if (!liveClassScheduledDate) {
        toast.error("Scheduled date is required");
      } else {
        toast.error("Please fill in all required fields");
      }
    }
  };

  const handleAddLecture = async () => {
    // For prerecorded videos, we only need title and uploaded file
    const isPrerecordedValid =
      selectedLectureType === "prerecorded" &&
      lectureTitle.trim() &&
      uploadedFile;
    // For other types, we need title and type-specific content
    const isOtherValid =
      selectedLectureType !== "prerecorded" &&
      lectureTitle.trim() &&
      ((selectedLectureType === "youtube" && youtubeUrl.trim()) ||
        (selectedLectureType === "text" && lectureText.trim()) ||
        (selectedLectureType === "document" && uploadedFile));

    if (
      (isPrerecordedValid || isOtherValid) &&
      currentCourse?._id &&
      currentSectionId
    ) {
      setIsFileUploading(true);
      try {
        let lessonData;

        // Parse duration
        const durationParts = lectureDuration.split(":");
        const duration = {
          hours: parseInt(durationParts[0]) || 0,
          minutes: parseInt(durationParts[1]) || 0,
          seconds: parseInt(durationParts[2]) || 0,
        };

        // Extract string content from rich text editor object
        // For prerecorded videos, summary is optional (auto-generated from video content)
        const descriptionText =
          selectedLectureType === "prerecorded"
            ? "" // No summary needed for prerecorded videos
            : typeof lectureSummary === "object" && lectureSummary?.html
            ? lectureSummary.html
            : typeof lectureSummary === "string"
            ? lectureSummary
            : "";

        if (selectedLectureType === "prerecorded" && uploadedFile) {
          const fileSizeMB = uploadedFile.size / (1024 * 1024);
          
          if (fileSizeMB > 4) {
            // Use multipart upload for large files
            try {
              const uploadResult = await uploadLargeFile(uploadedFile, 'videos');
              
              lessonData = {
                title: lectureTitle.trim(),
                description: `Video lecture: ${lectureTitle.trim()}`,
                type: "video",
                hours: duration.hours.toString(),
                minutes: duration.minutes.toString(),
                seconds: duration.seconds.toString(),
                isFree: false,
                videoUrl: uploadResult.url,
                videoKey: uploadResult.key,
                videoName: uploadedFile.name,
                videoSize: uploadedFile.size,
                videoType: uploadedFile.type
              };
            } catch (error) {
              toast.error("Failed to upload large video file");
              throw error;
            }
          } else {
            // Use regular FormData upload for smaller files
            const formData = new FormData();
            formData.append("title", lectureTitle.trim());
            formData.append(
              "description",
              `Video lecture: ${lectureTitle.trim()}`
            );
            formData.append("type", "video");
            formData.append("hours", duration.hours.toString());
            formData.append("minutes", duration.minutes.toString());
            formData.append("seconds", duration.seconds.toString());
            formData.append("isFree", "false");
            formData.append("videoFile", uploadedFile);

            lessonData = formData;
          }
        } else if (selectedLectureType === "document" && uploadedFile) {
          const fileSizeMB = uploadedFile.size / (1024 * 1024);
          
          if (fileSizeMB > 4) {
            // Use multipart upload for large documents
            try {
              const uploadResult = await uploadLargeFile(uploadedFile, 'documents');
              
              lessonData = {
                title: lectureTitle.trim(),
                description: descriptionText,
                type: "document",
                hours: duration.hours.toString(),
                minutes: duration.minutes.toString(),
                seconds: duration.seconds.toString(),
                isFree: false,
                documentUrl: uploadResult.url,
                documentKey: uploadResult.key,
                documentName: uploadedFile.name,
                documentSize: uploadedFile.size,
                documentType: uploadedFile.type
              };
            } catch (error) {
              toast.error("Failed to upload large document file");
              throw error;
            }
          } else {
            // Use regular FormData upload for smaller files
            const formData = new FormData();
            formData.append("title", lectureTitle.trim());
            formData.append("description", descriptionText);
            formData.append("type", "document");
            formData.append("hours", duration.hours.toString());
            formData.append("minutes", duration.minutes.toString());
            formData.append("seconds", duration.seconds.toString());
            formData.append("isFree", "false");
            formData.append("documentFile", uploadedFile);

            lessonData = formData;
          }
        } else {
          // For YouTube and text lessons
          lessonData = {
            title: lectureTitle.trim(),
            description: descriptionText,
            type: selectedLectureType === "youtube" ? "youtube" : "text",
            duration: duration,
            isFree: false,
            youtubeUrl:
              selectedLectureType === "youtube" ? youtubeUrl : undefined,
            textContent:
              selectedLectureType === "text" ? lectureText : undefined,
          };
        }

        const result = await createLesson(
          currentCourse._id,
          currentSectionId,
          lessonData
        );
        if (result) {
          resetLectureForm();
        }
      } catch (error) {
        toast.error("Failed to create lesson");
      } finally {
        setIsFileUploading(false);
      }
    } else {
      // Provide specific error messages
      if (!lectureTitle.trim()) {
        toast.error("Lecture title is required");
      } else if (selectedLectureType === "prerecorded" && !uploadedFile) {
        toast.error("Please upload a video file");
      } else if (selectedLectureType === "youtube" && !youtubeUrl.trim()) {
        toast.error("YouTube URL is required");
      } else if (selectedLectureType === "text" && !lectureText.trim()) {
        toast.error("Text content is required");
      } else if (selectedLectureType === "document" && !uploadedFile) {
        toast.error("Please upload a document");
      } else {
        toast.error("Please fill in all required fields");
      }
    }
  };

  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  const handleAddQuiz = async () => {
    setIsLoadingQuiz(true);
    // Debug logging for quiz validation
    /*console.log("Quiz validation debug:", {
      quizTitle: quizTitle.trim(),
      quizTitleLength: quizTitle.trim().length,
      currentCourseId: currentCourse?._id,
      currentSectionId: currentSectionId,
      quizQuestionsLength: quizQuestions.length,
      editingQuizId: editingQuizId,
      isEditing: !!editingQuizId,
    });*/

    // For editing, we need to ensure we have the section ID from the quiz being edited
    const sectionId = editingQuizId ? currentSectionId : currentSectionId;

    //console.log("Using sectionId:", sectionId);

    if (
      quizTitle.trim() &&
      currentCourse?._id &&
      sectionId &&
      quizQuestions.length > 0
    ) {
      try {
        // Validate questions
        for (let i = 0; i < quizQuestions.length; i++) {
          const question = quizQuestions[i];
          if (!question.question.trim()) {
            toast.error(`Question ${i + 1} text is required`);
            return;
          }

          const hasEmptyOption = question.options.some(
            (option) => !option.text.trim()
          );
          if (hasEmptyOption) {
            toast.error(`All options for question ${i + 1} must have text`);
            return;
          }

          const correctAnswers = question.options.filter(
            (option) => option.isCorrect
          );
          if (correctAnswers.length !== 1) {
            toast.error(
              `Question ${i + 1} must have exactly one correct answer`
            );
            return;
          }
        }

        const quizData = {
          title: quizTitle.trim(),
          description: quizDescription.trim(),
          questions: quizQuestions,
          passingMarks: quizPassingMarks,
          timeLimit: quizTimeLimit,
          instructions: quizInstructions.trim(),
          allowRetake: quizAllowRetake,
          maxAttempts: quizMaxAttempts,
          shuffleQuestions: quizShuffleQuestions,
          shuffleOptions: quizShuffleOptions,
          showResults: quizShowResults,
          showCorrectAnswers: quizShowCorrectAnswers,
          isFree: quizIsFree,
        };

        let result;
        if (editingQuizId) {
          result = await updateQuiz(editingQuizId, quizData);
        } else {
          result = await createQuiz(sectionId, quizData);
        }

        if (result) {
          resetQuizForm(true); // Clear all including section and editing state
        }
      } catch (error) {
        toast.error("Failed to save quiz");
      }
    } else {
      // Provide specific error messages for missing fields
      if (!quizTitle.trim()) {
        //console.log("Validation failed: Quiz title is missing");
        toast.error("Quiz title is required");
      } else if (!currentCourse?._id) {
        //console.log("Validation failed: Course not found");
        toast.error("Course not found");
      } else if (!sectionId) {
        //console.log("Validation failed: Section not selected");
        toast.error("Section not selected");
      } else if (quizQuestions.length === 0) {
        //console.log("Validation failed: No questions");
        toast.error("At least one question is required");
      } else {
        //console.log("Validation failed: Unknown reason");
        toast.error("Please fill in all required fields");
      }
    }
    setIsLoadingQuiz(false);
  };

  const deleteQuizHandler = async (quizId) => {
    if (currentCourse?._id) {
      const result = await deleteQuiz(quizId);
      if (!result) {
        toast.error("Failed to delete quiz");
      }
    }
  };

  const handleEditQuiz = (quiz, sectionId) => {
    /*console.log("handleEditQuiz called with:", {
      quizId: quiz._id,
      quizTitle: quiz.title,
      sectionId: sectionId,
      currentCourse: currentCourse?._id,
    });*/

    setCurrentSectionId(sectionId);
    setEditingQuizId(quiz._id);
    setQuizTitle(quiz.title);
    setQuizDescription(quiz.description || "");
    setQuizPassingMarks(quiz.passingMarks);
    setQuizTimeLimit(quiz.timeLimit);
    setQuizInstructions(quiz.instructions || "");
    setQuizQuestions(quiz.questions);
    setQuizAllowRetake(quiz.allowRetake);
    setQuizMaxAttempts(quiz.maxAttempts);
    setQuizShuffleQuestions(quiz.shuffleQuestions);
    setQuizShuffleOptions(quiz.shuffleOptions);
    setQuizShowResults(quiz.showResults);
    setQuizShowCorrectAnswers(quiz.showCorrectAnswers);
    setQuizIsFree(quiz.isFree);
    setShowQuizFormModal(true);

    /*console.log("State set for editing quiz:", {
      editingQuizId: quiz._id,
      currentSectionId: sectionId,
      quizTitle: quiz.title,
      questionsCount: quiz.questions?.length || 0,
    });*/
  };

  const deleteLecture = async (chapterId, lectureId) => {
    if (currentCourse?._id) {
      const result = await deleteLesson(
        currentCourse._id,
        chapterId,
        lectureId
      );
      if (!result) {
        toast.error("Failed to delete lesson");
      }
    }
  };

  const handleEditLecture = (sectionId, lecture) => {
    setCurrentSectionId(sectionId);
    setEditingLectureId(lecture.id);
    setSelectedLectureType(lecture.type);
    setLectureTitle(lecture.title);
    setLectureDuration(lecture.duration || "");
    setLectureSummary(lecture.summary || "");
    setYoutubeUrl(lecture.youtubeUrl || "");
    setLectureText(lecture.text || "");
    setUploadedFile(lecture.file || null);
    setShowLectureFormModal(true);
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Add New Section
              </h2>
              <p className="text-gray-600">
                Enter the name for your new course section
              </p>
            </div>
            <div className="mb-6">
              <label
                htmlFor="sectionName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Section Name
              </label>
              <input
                id="sectionName"
                type="text"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g., Advanced JavaScript Concepts"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSection();
                  if (e.key === "Escape") handleCancelAddSection();
                }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelAddSection}
                className="px-4 cursor-pointer py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSection}
                disabled={!sectionName.trim() || addingSection}
                className={`${
                  addingSection ? "bg-indigo-400" : "bg-indigo-600"
                } cursor-pointer hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors`}
              >
                {addingSection ? "Adding Section..." : "Add Section"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lecture Type Selection Modal */}
      {showLectureTypeModal && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 shadow-xl">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 text-center">
                Select Lecture Type
              </h3>
              <div className="space-y-3">
                {lectureTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleLectureTypeSelect(type.id)}
                      className={`w-full cursor-pointer px-6 py-4 rounded-lg border-2 transition-all flex items-center justify-center gap-3 font-medium text-lg bg-white text-gray-600 border-gray-300 hover:bg-[var(--indigo-900)] hover:text-white`}
                    >
                      <Icon size={24} />
                      {type.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleCancelLectureType}
                  className="px-6 py-3 cursor-pointer text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lecture Form Modal */}
      {showLectureFormModal && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  placeholder="Enter Title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-gray-600"
                />
              </div>

              {/* Pre-recorded Video Form */}
              {selectedLectureType === "prerecorded" && (
                <>
                  {/* Duration is automatically extracted from video file */}
                  {(lectureDuration !== "00:00:00" || isExtractingDuration) && (
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-2">
                        Duration{" "}
                      </label>
                      <input
                        type="text"
                        value={
                          isExtractingDuration
                            ? "Extracting..."
                            : lectureDuration
                        }
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  )}

                  {/* Summary is not needed for prerecorded videos */}

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Attachment
                    </label>
                    <input
                      type="file"
                      id="video-upload"
                      accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
                      onChange={handleFileUpload}
                      disabled={isFileUploading}
                      className="hidden"
                    />
                    <label
                      htmlFor="video-upload"
                      className={`border-2 border-gray-200 rounded-lg p-12 text-center bg-gray-50 block cursor-pointer hover:bg-gray-100 transition-colors ${
                        isFileUploading || isExtractingDuration
                          ? "opacity-75 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-[var(--rose-500)] rounded-lg flex items-center justify-center">
                          <Video className="text-white" size={32} />
                        </div>
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        {isExtractingDuration
                          ? "Extracting duration..."
                          : isFileUploading || isMultipartUploading
                          ? isMultipartUploading && uploadProgress > 0
                            ? `Uploading... ${Math.round(uploadProgress)}%`
                            : "Processing..."
                          : uploadedFile
                          ? uploadedFile.name
                          : "Upload Video"}
                      </p>
                      <p className="text-gray-500 text-sm">
                        MP4, MOV, AVI,and MKV formats, up to 2 GB
                      </p>
                    </label>
                  </div>
                </>
              )}

              {/* YouTube Video Form */}
              {selectedLectureType === "youtube" && (
                <>
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Duration
                      {/* {selectedLectureType === "youtube" && (
                        <span className="text-sm text-gray-500 ml-2">(Auto-fetched from YouTube)</span>
                      )} */}
                    </label>
                    <input
                      type="text"
                      value={lectureDuration}
                      disabled={true}
                      onChange={(e) => setLectureDuration(e.target.value)}
                      placeholder="00:00:00"
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                        selectedLectureType === "youtube"
                          ? "text-gray-500 bg-gray-50"
                          : "text-gray-400"
                      }`}
                      title={
                        selectedLectureType === "youtube"
                          ? "Duration is auto-fetched from YouTube. You can still edit if needed."
                          : "Enter video duration in HH:MM:SS format"
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Summary
                    </label>
                    <RichTextEditor
                      content={lectureSummary}
                      onChange={setLectureSummary}
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      YouTube Video URL
                    </label>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                      placeholder="Enter Youtube URL (duration will be fetched automatically)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-gray-600"
                      disabled={isExtractingDuration}
                    />
                    {isExtractingDuration && (
                      <p className="text-sm text-blue-600 mt-1 flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Fetching video duration...
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Upload Document Form */}
              {selectedLectureType === "document" && (
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Attachment
                  </label>
                  <input
                    type="file"
                    id="document-upload"
                    accept="
    image/jpeg,
    image/png,
    image/gif,
    image/webp,
    application/pdf,
    application/msword,
    application/vnd.openxmlformats-officedocument.wordprocessingml.document,
    application/vnd.ms-excel,
    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
    text/plain
  "
                    onChange={handleFileUpload}
                    disabled={isFileUploading}
                    className="hidden"
                  />

                  <label
                    htmlFor="document-upload"
                    className={`border-2 border-gray-200 rounded-lg p-12 text-center bg-gray-50 block cursor-pointer hover:bg-gray-100 transition-colors ${
                      isFileUploading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-[var(--rose-500)] rounded-lg flex items-center justify-center">
                        <Upload className="text-white" size={32} />
                      </div>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {isFileUploading
                        ? "Processing..."
                        : uploadedFile
                        ? uploadedFile.name
                        : "Upload Document"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      JPEG, PNG, GIF,and WebP formats, up to 10 MB
                    </p>
                  </label>
                </div>
              )}

              {/* Text Form */}
              {selectedLectureType === "text" && (
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Text
                  </label>
                  <textarea
                    value={lectureText}
                    onChange={(e) => setLectureText(e.target.value)}
                    placeholder="Enter Text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-gray-600 min-h-[300px] resize-none"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={resetLectureForm}
                  className="px-6 py-3 cursor-pointer text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLecture}
                  disabled={
                    !lectureTitle.trim() ||
                    isFileUploading ||
                    isMultipartUploading ||
                    isExtractingDuration
                  }
                  className="bg-[var(--rose-500)] cursor-pointer hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-8 py-3 rounded-full transition-colors"
                >
                  {isExtractingDuration
                    ? "Extracting duration..."
                    : isFileUploading || isMultipartUploading
                    ? isMultipartUploading && uploadProgress > 0
                      ? `Uploading... ${Math.round(uploadProgress)}%`
                      : "Uploading..."
                    : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Form Modal */}
      {showQuizFormModal && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingQuizId ? "Edit Quiz" : "Create New Quiz"}
              </h2>

              {/* Quiz Title */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quiz title"
                />
              </div>

              {/* Quiz Description */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter quiz description"
                />
              </div>

              {/* Quiz Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Passing Marks (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quizPassingMarks}
                    onChange={(e) =>
                      setQuizPassingMarks(parseInt(e.target.value))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quizMaxAttempts}
                    onChange={(e) =>
                      setQuizMaxAttempts(parseInt(e.target.value))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Time Limit */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Time Limit
                </label>

                <div className="flex gap-2 items-center">
                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={quizTimeLimit.hours}
                      onChange={(e) =>
                        setQuizTimeLimit({
                          ...quizTimeLimit,
                          hours: parseInt(e.target.value) || 0,
                        })
                      }
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Minutes
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={quizTimeLimit.minutes}
                      onChange={(e) =>
                        setQuizTimeLimit({
                          ...quizTimeLimit,
                          minutes: parseInt(e.target.value) || 0,
                        })
                      }
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Seconds
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={quizTimeLimit.seconds}
                      onChange={(e) =>
                        setQuizTimeLimit({
                          ...quizTimeLimit,
                          seconds: parseInt(e.target.value) || 0,
                        })
                      }
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Instructions
                </label>
                <textarea
                  value={quizInstructions}
                  onChange={(e) => setQuizInstructions(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter quiz instructions"
                />
              </div>

              {/* Quiz Options */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quiz Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={quizAllowRetake}
                      onChange={(e) => setQuizAllowRetake(e.target.checked)}
                      className="rounded"
                    />
                    <span>Allow Retake</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={quizShuffleQuestions}
                      onChange={(e) =>
                        setQuizShuffleQuestions(e.target.checked)
                      }
                      className="rounded"
                    />
                    <span>Shuffle Questions</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={quizShuffleOptions}
                      onChange={(e) => setQuizShuffleOptions(e.target.checked)}
                      className="rounded"
                    />
                    <span>Shuffle Options</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={quizShowResults}
                      onChange={(e) => setQuizShowResults(e.target.checked)}
                      className="rounded"
                    />
                    <span>Show Results</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={quizShowCorrectAnswers}
                      onChange={(e) =>
                        setQuizShowCorrectAnswers(e.target.checked)
                      }
                      className="rounded"
                    />
                    <span>Show Correct Answers</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={quizIsFree}
                      onChange={(e) => setQuizIsFree(e.target.checked)}
                      className="rounded"
                    />
                    <span>Free Quiz</span>
                  </label>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Questions
                  </h3>
                  <div className="flex gap-2">
                    {/* Generate with AI Button */}
                    <button
                      onClick={handleGenerateWithAI}
                      disabled={isGeneratingQuiz || !chapters?.length}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {isGeneratingQuiz ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Generate with AI
                        </>
                      )}
                    </button>
                    <button
                      onClick={addQuestion}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add Question
                    </button>
                  </div>
                </div>

                {quizQuestions.map((question, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="border border-gray-300 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900">
                        Question {questionIndex + 1}
                      </h4>
                      {quizQuestions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(questionIndex)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(
                              questionIndex,
                              "question",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter question text"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Options
                        </span>
                        <button
                          onClick={() => addOption(questionIndex)}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        >
                          + Add Option
                        </button>
                      </div>

                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            checked={option.isCorrect}
                            onChange={() =>
                              updateOption(
                                questionIndex,
                                optionIndex,
                                "isCorrect",
                                true
                              )
                            }
                            className="text-blue-500"
                          />
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) =>
                              updateOption(
                                questionIndex,
                                optionIndex,
                                "text",
                                e.target.value
                              )
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          {question.options.length > 2 && (
                            <button
                              onClick={() =>
                                removeOption(questionIndex, optionIndex)
                              }
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Marks:
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) =>
                            updateQuestion(
                              questionIndex,
                              "points",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={resetQuizForm}
                  className="px-6 py-3 cursor-pointer text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddQuiz}
                  disabled={
                    !quizTitle.trim() ||
                    isLoadingQuiz ||
                    quizQuestions.some((q) => !q.question.trim())
                  }
                  className="bg-[var(--rose-500)] cursor-pointer hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-8 py-3 rounded-full transition-colors"
                >
                  <button>
                    {isLoadingQuiz
                      ? editingQuizId
                        ? "Updating Quiz..."
                        : "Creating Quiz..."
                      : editingQuizId
                      ? "Update Quiz"
                      : "Create Quiz"}
                  </button>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Class Form Modal */}
      {showLiveClassFormModal && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Schedule Live Class
              </h2>

              {/* Live Class Title */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Live Class Title *
                </label>
                <input
                  type="text"
                  value={liveClassTitle}
                  onChange={(e) => setLiveClassTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter live class title"
                />
              </div>

              {/* Live Class Description */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Description *
                </label>
                <textarea
                  value={liveClassDescription}
                  onChange={(e) => setLiveClassDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter live class description"
                />
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={liveClassScheduledDate}
                  onChange={(e) => setLiveClassScheduledDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Duration and Max Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="480"
                    value={liveClassDuration}
                    onChange={(e) =>
                      setLiveClassDuration(parseInt(e.target.value))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={liveClassMaxParticipants}
                    onChange={(e) =>
                      setLiveClassMaxParticipants(parseInt(e.target.value))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={resetLiveClassForm}
                  className="px-6 py-3 cursor-pointer text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLiveClass}
                  disabled={
                    !liveClassTitle.trim() ||
                    !liveClassDescription.trim() ||
                    !liveClassScheduledDate ||
                    isLiveLoading
                  }
                  className="bg-[var(--indigo-800)] cursor-pointer hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-8 py-3 rounded-full transition-colors"
                >
                  {isLiveLoading ? "Scheduling..." : "Schedule Live Class"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 mb-8">
        <h1 className="text-[20px] font-bold text-gray-900">Curriculum</h1>
        <button
          className="bg-[var(--indigo-800)] cursor-pointer hover:bg-indigo-700 text-[14px] text-white py-[8px] px-[20px] rounded-[100px] font-semibold flex items-center gap-2 transition-colors"
          onClick={addNewSection}
        >
          <div className="rounded-full bg-white">
            <Plus size={15} className="text-black" />
          </div>
          Add Lesson
        </button>
      </div>

      {/* Curriculum Sections */}
      <div className="space-y-4">
        {chapters.map((section) => (
          <div
            key={section.id}
            className="bg-[var(--gray-50)] rounded-lg shadow-sm border border-[var(--gray-100)]"
          >
            {/* Section Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center gap-2">
                <img
                  src="/dashboard/instructor/section.png"
                  className="h-[14px] w-[13px]"
                  alt=""
                />
                <h3 className="font-semibold text-[15px] text-gray-900">
                  {section.title}
                </h3>
              </div>
              <button className="p-1 cursor-pointer hover:bg-gray-600 bg-black rounded-full transition-colors">
                {expandedSections[section.id] ? (
                  <ChevronUp size={20} className="text-white" />
                ) : (
                  <ChevronDown size={20} className="text-white" />
                )}
              </button>
            </div>

            {expandedSections[section.id] && (
              <div className="border-t border-gray-200">
                {/* Lectures with Drag and Drop */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={section.lessons?.map((lesson) => lesson._id) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    {section.lessons?.map((lecture) => (
                      <SortableLectureItem
                        key={lecture._id}
                        lecture={lecture}
                        sectionId={section._id}
                        onEdit={handleEditLecture}
                        onDelete={deleteLecture}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                {/* Quizzes */}
                {section.quizzes?.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="m-4 rounded-[6px] flex items-center justify-between border border-[var(--gray-100)] px-6 py-3 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[var(--blue-500)] p-1.5 rounded-full flex items-center justify-center">
                        <HelpCircle
                          size={10}
                          className="text-white fill-white"
                        />
                      </div>
                      <span
                        className={`${
                          quiz.isPublished ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {quiz.title} - {quiz.questions?.length || 0} questions
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Quiz
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditQuiz(quiz, section._id);
                        }}
                      >
                        <Edit size={16} className="text-gray-500" />
                      </button>
                      <button
                        className="p-2 hover:bg-red-100 rounded-full transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuizHandler(quiz._id);
                        }}
                      >
                        <Trash2 size={16} className="text-[var(--rose-500)]" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="px-6 py-4">
                  <button
                    className="bg-[var(--indigo-800)] cursor-pointer hover:bg-indigo-700 text-[14px] text-white py-[8px] px-[20px] rounded-[100px] font-medium flex items-center gap-2 transition-colors"
                    onClick={() => handleAddLectureClick(section._id)}
                  >
                    <div className="rounded-full bg-white">
                      <Plus size={15} className="text-black" />
                    </div>
                    Add Course Content
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save and Continue Button */}
      <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={() => {
            if (onNext) onNext();
          }}
          disabled={isLoading || chapters.length === 0}
          className="bg-[var(--indigo-900)] cursor-pointer hover:bg-indigo-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
        >
          {isLoading ? "Loading..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
};

export default CurriculumComponent;
