"use client";
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import CourseService from '@/lib/services/courseService';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  currentCourse: null,
  currentStep: 1,
  isLoading: false,
  error: null,
  chapters: [],
  faqs: [],
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CURRENT_COURSE: 'SET_CURRENT_COURSE',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_CHAPTERS: 'SET_CHAPTERS',
  SET_FAQS: 'SET_FAQS',
  ADD_CHAPTER: 'ADD_CHAPTER',
  UPDATE_CHAPTER: 'UPDATE_CHAPTER',
  DELETE_CHAPTER: 'DELETE_CHAPTER',
  ADD_FAQ: 'ADD_FAQ',
  UPDATE_FAQ: 'UPDATE_FAQ',
  DELETE_FAQ: 'DELETE_FAQ',
  ADD_QUIZ: 'ADD_QUIZ',
  UPDATE_QUIZ: 'UPDATE_QUIZ',
  DELETE_QUIZ: 'DELETE_QUIZ',
  RESET_STATE: 'RESET_STATE',
};

// Reducer
function courseReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case ActionTypes.SET_CURRENT_COURSE:
      return { ...state, currentCourse: action.payload, isLoading: false };
    
    case ActionTypes.SET_CURRENT_STEP:
      return { ...state, currentStep: action.payload };
    
    case ActionTypes.SET_CHAPTERS:
      return { ...state, chapters: action.payload };
    
    case ActionTypes.SET_FAQS:
      return { ...state, faqs: action.payload };
    
    case ActionTypes.ADD_CHAPTER:
      return { ...state, chapters: [...state.chapters, action.payload] };
    
    case ActionTypes.UPDATE_CHAPTER:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter._id === action.payload._id ? action.payload : chapter
        ),
      };
    
    case ActionTypes.DELETE_CHAPTER:
      return {
        ...state,
        chapters: state.chapters.filter(chapter => chapter._id !== action.payload),
      };
    
    case ActionTypes.ADD_FAQ:
      return { ...state, faqs: [...state.faqs, action.payload] };
    
    case ActionTypes.UPDATE_FAQ:
      return {
        ...state,
        faqs: state.faqs.map(faq =>
          faq._id === action.payload._id ? action.payload : faq
        ),
      };
    
    case ActionTypes.DELETE_FAQ:
      return {
        ...state,
        faqs: state.faqs.filter(faq => faq._id !== action.payload),
      };
    
    case ActionTypes.ADD_QUIZ:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter._id === action.payload.chapter
            ? { ...chapter, quizzes: [...(chapter.quizzes || []), action.payload] }
            : chapter
        ),
      };
    
    case ActionTypes.UPDATE_QUIZ:
      return {
        ...state,
        chapters: state.chapters.map(chapter =>
          chapter._id === action.payload.chapter
            ? {
                ...chapter,
                quizzes: (chapter.quizzes || []).map(quiz =>
                  quiz._id === action.payload._id ? action.payload : quiz
                ),
              }
            : chapter
        ),
      };
    
    case ActionTypes.DELETE_QUIZ:
      return {
        ...state,
        chapters: state.chapters.map(chapter => ({
          ...chapter,
          quizzes: (chapter.quizzes || []).filter(quiz => quiz._id !== action.payload),
        })),
      };
    
    case ActionTypes.RESET_STATE:
      return initialState;
    
    default:
      return state;
  }
}

// Create context
const CourseContext = createContext();

// Provider component
export function CourseProvider({ children }) {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  // Course operations
  const createCourse = async (courseData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.createCourse(courseData);
      if (result.success) {
        dispatch({ type: ActionTypes.SET_CURRENT_COURSE, payload: result.data });
        toast.success(result.message || 'Course created successfully!');
        return result.data;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to create course');
        return null;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return null;
    }
  };

  const updateCourse = async (courseId, courseData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.updateCourse(courseId, courseData);
      if (result.success) {
        dispatch({ type: ActionTypes.SET_CURRENT_COURSE, payload: result.data });
        toast.success(result.message || 'Course updated successfully!');
        return result.data;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to update course');
        return null;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return null;
    }
  };

  const uploadThumbnail = async (courseId, thumbnailFile, isFeatured = false) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.uploadThumbnail(courseId, thumbnailFile, isFeatured);
      if (result.success) {
        // Update current course with new thumbnail data
        const updatedCourse = { 
          ...state.currentCourse, 
          thumbnail: result.data.thumbnail,
          isFeatured: result.data.isFeatured 
        };
        dispatch({ type: ActionTypes.SET_CURRENT_COURSE, payload: updatedCourse });
        toast.success(result.message || 'Thumbnail uploaded successfully!');
        return result.data;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to upload thumbnail');
        return null;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return null;
    }
  };

  // Chapter operations
  const createChapter = async (courseId, chapterData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.createChapter(courseId, chapterData);
      if (result.success) {
        dispatch({ type: ActionTypes.ADD_CHAPTER, payload: result.data });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        toast.success(result.message || 'Chapter created successfully!');
        return result.data;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to create chapter');
        return null;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return null;
    }
  };

  const updateChapter = async (courseId, chapterId, chapterData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.updateChapter(courseId, chapterId, chapterData);
      if (result.success) {
        dispatch({ type: ActionTypes.UPDATE_CHAPTER, payload: result.data });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        toast.success(result.message || 'Chapter updated successfully!');
        return result.data;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to update chapter');
        return null;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return null;
    }
  };

  const deleteChapter = async (courseId, chapterId) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.deleteChapter(courseId, chapterId);
      if (result.success) {
        dispatch({ type: ActionTypes.DELETE_CHAPTER, payload: chapterId });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        toast.success(result.message || 'Chapter deleted successfully!');
        return true;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to delete chapter');
        return false;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return false;
    }
  };

  // Lesson operations
  const createLesson = async (courseId, chapterId, lessonData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.createLesson(courseId, chapterId, lessonData);
      if (result.success) {
        // Refresh chapters to get updated lesson data
        await fetchChapters(courseId);
        toast.success(result.message || 'Lesson created successfully!');
        return result.data;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to create lesson');
        return null;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const deleteLesson = async (courseId, chapterId, lessonId) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.deleteLesson(courseId, chapterId, lessonId);
      if (result.success) {
        // Refresh chapters to get updated lesson data
        await fetchChapters(courseId);
        toast.success(result.message || 'Lesson deleted successfully!');
        return true;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to delete lesson');
        return false;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const reorderLessons = async (courseId, chapterId, lessonOrder) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.reorderLessons(courseId, chapterId, lessonOrder);
      if (result.success) {
        // Refresh chapters to get updated lesson data
        await fetchChapters(courseId);
        toast.success('Lessons reordered successfully!');
        return true;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to reorder lessons');
        return false;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // FAQ operations
  const createFAQ = async (courseId, faqData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.createFAQ(courseId, faqData);
      if (result.success) {
        dispatch({ type: ActionTypes.ADD_FAQ, payload: result.data });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        toast.success(result.message || 'FAQ created successfully!');
        return result.data;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to create FAQ');
        return null;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return null;
    }
  };

  const updateFAQ = async (courseId, faqId, faqData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.updateFAQ(courseId, faqId, faqData);
      if (result.success) {
        dispatch({ type: ActionTypes.UPDATE_FAQ, payload: result.data });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        toast.success(result.message || 'FAQ updated successfully!');
        return result.data;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to update FAQ');
        return null;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return null;
    }
  };

  const deleteFAQ = async (courseId, faqId) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.deleteFAQ(courseId, faqId);
      if (result.success) {
        dispatch({ type: ActionTypes.DELETE_FAQ, payload: faqId });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        toast.success(result.message || 'FAQ deleted successfully!');
        return true;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to delete FAQ');
        return false;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return false;
    }
  };

  // Pricing operation
  const updatePricing = async (courseId, pricingData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.updatePricing(courseId, pricingData);
      if (result.success) {
        // Update current course with new pricing data
        const updatedCourse = { ...state.currentCourse, ...result.data };
        dispatch({ type: ActionTypes.SET_CURRENT_COURSE, payload: updatedCourse });
        toast.success(result.message || 'Pricing updated successfully!');
        return result.data;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to update pricing');
        return null;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return null;
    }
  };

  // Publish course
  const publishCourse = async (courseId) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.publishCourse(courseId);
      if (result.success) {
        // Update current course with published status
        const updatedCourse = { ...state.currentCourse, ...result.data };
        dispatch({ type: ActionTypes.SET_CURRENT_COURSE, payload: updatedCourse });
        toast.success(result.message || 'Course published successfully!');
        return result.data;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to publish course');
        return null;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return null;
    }
  };

  // Save course as draft
  const saveDraft = async (courseId, pricingData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      // Combine pricing data with draft status
      const draftData = {
        ...pricingData,
        status: 'draft'
      };
      
      const result = await CourseService.updateCourse(courseId, draftData);
      if (result.success) {
        // Update current course with new data
        const updatedCourse = { ...state.currentCourse, ...result.data };
        dispatch({ type: ActionTypes.SET_CURRENT_COURSE, payload: updatedCourse });
        toast.success('Course saved as draft successfully!');
        return result.data;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to save course as draft');
        return null;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return null;
    }
  };

  // Utility functions
  const fetchChapters = useCallback(async (courseId) => {
    try {
      const result = await CourseService.getChapters(courseId);
      if (result.success) {
        dispatch({ type: ActionTypes.SET_CHAPTERS, payload: result.data });
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  }, []);

  const fetchFAQs = useCallback(async (courseId) => {
    try {
      const result = await CourseService.getFAQs(courseId);
      if (result.success) {
        dispatch({ type: ActionTypes.SET_FAQS, payload: result.data });
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  }, []);

  const fetchCourse = useCallback(async (courseId) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const result = await CourseService.getCourse(courseId);
      if (result.success) {
        dispatch({ type: ActionTypes.SET_CURRENT_COURSE, payload: result.data });
        // Also fetch chapters and FAQs for this course
        await Promise.all([
          fetchChapters(courseId),
          fetchFAQs(courseId)
        ]);
        return result.data;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to fetch course');
        return null;
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [fetchChapters, fetchFAQs]);

  // Quiz operations
  const createQuiz = async (chapterId, quizData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const response = await fetch(`/api/chapters/${chapterId}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      });

      const result = await response.json();
      
      if (result.success) {
        dispatch({ type: ActionTypes.ADD_QUIZ, payload: result.data });
        toast.success(result.message || 'Quiz created successfully!');
        return result.data;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to create quiz');
        return null;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const updateQuiz = async (quizId, quizData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      });

      const result = await response.json();
      
      if (result.success) {
        dispatch({ type: ActionTypes.UPDATE_QUIZ, payload: result.data });
        toast.success(result.message || 'Quiz updated successfully!');
        return result.data;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to update quiz');
        return null;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const deleteQuiz = async (quizId) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        dispatch({ type: ActionTypes.DELETE_QUIZ, payload: quizId });
        toast.success(result.message || 'Quiz deleted successfully!');
        return true;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message });
        toast.error(result.message || 'Failed to delete quiz');
        return false;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const fetchQuizzes = async (chapterId) => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}/quizzes`);
      const result = await response.json();
      
      if (result.success) {
        // Update the chapter with quizzes
        dispatch({
          type: ActionTypes.UPDATE_CHAPTER,
          payload: {
            _id: chapterId,
            quizzes: result.data
          }
        });
        return result.data;
      } else {
        console.error('Failed to fetch quizzes:', result.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return [];
    }
  };

  const setCurrentStep = useCallback((step) => {
    dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: step });
  }, []);

  const resetCourseState = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_STATE });
  }, []);

  const value = {
    ...state,
    createCourse,
    updateCourse,
    uploadThumbnail,
    createChapter,
    updateChapter,
    deleteChapter,
    createLesson,
    deleteLesson,
    reorderLessons,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    fetchQuizzes,
    updatePricing,
    publishCourse,
    saveDraft,
    fetchCourse,
    fetchChapters,
    fetchFAQs,
    setCurrentStep,
    resetCourseState,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
}

// Custom hook to use the course context
export function useCourse() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}

export default CourseContext;