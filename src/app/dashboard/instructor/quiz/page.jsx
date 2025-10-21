"use client"
import CurriculumComponent from '@/components/dashboard/instructor/CurriculumStep';
import { CourseProvider } from '@/contexts/CourseContext';

// const QuizGenerator = () => {

//     const [selectedFile, setSelectedFile] = useState(null);
//     const [uploading, setUploading] = useState(false);
//     const [quizData, setQuizData] = useState(null);
//     const [error, setError] = useState('');

//     const handleFileChange = (e) => {
//         if (e.target.files && e.target.files[0]) {
//             const file = e.target.files[0];

//             // Check if file is a video
//             if (!file.type.startsWith('video/')) {
//                 setError('Please select a video file');
//                 setSelectedFile(null);
//                 return;
//             }

//             // Check file size (100MB max)
//             const maxSize = 100 * 1024 * 1024;
//             if (file.size > maxSize) {
//                 setError('File too large. Maximum size is 100MB');
//                 setSelectedFile(null);
//                 return;
//             }

//             setSelectedFile(file);
//             setError('');
//         }
//     };

//     // Updated handleUpload function with better error handling
//     const handleUpload = async () => {
//         if (!selectedFile) {
//             setError('Please select a video file first');
//             return;
//         }

//         setUploading(true);
//         setError('');

//         const formData = new FormData();
//         formData.append('video', selectedFile);

//         try {
//             console.log('Starting upload...');
//             const response = await fetch('/api/quiz-test', {
//                 method: 'POST',
//                 body: formData,
//             });

//             const data = await response.json();

//             if (!response.ok) {
//                 console.error('Server error:', data);
//                 throw new Error(data.error || `Server error: ${response.status}`);
//             }

//             console.log('Quiz generated successfully:', data);
//             setQuizData(data.quiz);

//         } catch (err) {
//             console.error('Upload error:', err);
//             setError(err.message || 'Error generating quiz. Please try again.');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const handleQuestionChange = (index, field, value) => {
//         const updatedQuiz = { ...quizData };
//         updatedQuiz.questions[index][field] = value;
//         setQuizData(updatedQuiz);
//     };

//     const handleOptionChange = (qIndex, oIndex, value) => {
//         const updatedQuiz = { ...quizData };
//         updatedQuiz.questions[qIndex].options[oIndex] = value;
//         setQuizData(updatedQuiz);
//     };

//     const handleCorrectAnswerChange = (qIndex, value) => {
//         const updatedQuiz = { ...quizData };
//         updatedQuiz.questions[qIndex].correctAnswer = value;
//         setQuizData(updatedQuiz);
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-3xl mx-auto">
//                 <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//                     <h1 className="text-2xl font-bold text-gray-800 mb-4">
//                         AI Quiz Generator
//                     </h1>
//                     <p className="text-gray-600 mb-6">
//                         Upload a video and AI will generate a quiz based on its content
//                     </p>

//                     {/* File Upload Section */}
//                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
//                         <input
//                             type="file"
//                             accept="video/*"
//                             onChange={handleFileChange}
//                             className="hidden"
//                             id="video-upload"
//                         />
//                         <label
//                             htmlFor="video-upload"
//                             className="cursor-pointer block"
//                         >
//                             <div className="flex flex-col items-center justify-center">
//                                 <svg
//                                     className="w-12 h-12 text-gray-400 mb-3"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     viewBox="0 0 24 24"
//                                 >
//                                     <path
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         strokeWidth={2}
//                                         d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
//                                     />
//                                 </svg>
//                                 <span className="text-lg font-medium text-gray-700">
//                                     {selectedFile ? selectedFile.name : 'Choose video file'}
//                                 </span>
//                                 <span className="text-sm text-gray-500 mt-1">
//                                     MP4, MOV, AVI, etc. (Max: 100MB)
//                                 </span>
//                             </div>
//                         </label>
//                     </div>

//                     {error && (
//                         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
//                             {error}
//                         </div>
//                     )}

//                     {/* Upload Button */}
//                     <button
//                         onClick={handleUpload}
//                         disabled={uploading || !selectedFile}
//                         className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${uploading || !selectedFile
//                                 ? 'bg-gray-400 cursor-not-allowed'
//                                 : 'bg-blue-600 hover:bg-blue-700'
//                             }`}
//                     >
//                         {uploading ? (
//                             <div className="flex items-center justify-center">
//                                 <svg
//                                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     fill="none"
//                                     viewBox="0 0 24 24"
//                                 >
//                                     <circle
//                                         className="opacity-25"
//                                         cx="12"
//                                         cy="12"
//                                         r="10"
//                                         stroke="currentColor"
//                                         strokeWidth="4"
//                                     ></circle>
//                                     <path
//                                         className="opacity-75"
//                                         fill="currentColor"
//                                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                     ></path>
//                                 </svg>
//                                 Generating Quiz...
//                             </div>
//                         ) : (
//                             'Generate Quiz with AI'
//                         )}
//                     </button>
//                 </div>

//                 {/* Quiz Editor Section */}
//                 {quizData && (
//                     <div className="bg-white rounded-lg shadow-md p-6">
//                         <h2 className="text-xl font-bold text-gray-800 mb-4">
//                             Edit Your Quiz
//                         </h2>
//                         <div className="mb-4">
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Quiz Title
//                             </label>
//                             <input
//                                 type="text"
//                                 value={quizData.title}
//                                 onChange={(e) =>
//                                     setQuizData({ ...quizData, title: e.target.value })
//                                 }
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                         </div>

//                         {quizData.questions.map((question, qIndex) => (
//                             <div
//                                 key={qIndex}
//                                 className="border border-gray-200 rounded-lg p-4 mb-4"
//                             >
//                                 <div className="mb-3">
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Question {qIndex + 1}
//                                     </label>
//                                     <input
//                                         type="text"
//                                         value={question.question}
//                                         onChange={(e) =>
//                                             handleQuestionChange(qIndex, 'question', e.target.value)
//                                         }
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     />
//                                 </div>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
//                                     {question.options.map((option, oIndex) => (
//                                         <div key={oIndex}>
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                                 Option {oIndex + 1}
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={option}
//                                                 onChange={(e) =>
//                                                     handleOptionChange(qIndex, oIndex, e.target.value)
//                                                 }
//                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                             />
//                                         </div>
//                                     ))}
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Correct Answer
//                                     </label>
//                                     <select
//                                         value={question.correctAnswer}
//                                         onChange={(e) =>
//                                             handleCorrectAnswerChange(qIndex, e.target.value)
//                                         }
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     >
//                                         {question.options.map((option, oIndex) => (
//                                             <option key={oIndex} value={option}>
//                                                 Option {oIndex + 1}: {option}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             </div>
//                         ))}

//                         <div className="flex space-x-4">
//                             <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
//                                 Save Quiz
//                             </button>
//                             <button
//                                 onClick={() => setQuizData(null)}
//                                 className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
//                             >
//                                 Generate New Quiz
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default QuizGenerator;

import React from 'react'

const Page = () => {
    return (
        <CourseProvider>
        <CurriculumComponent/>
        </CourseProvider>
    )
}

export default Page