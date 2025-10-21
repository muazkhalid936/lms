import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync, createReadStream } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import OpenAI from 'openai';
import { stat } from 'fs/promises';

const execPromise = promisify(exec);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

export async function POST(request) {
    let videoPath = null;

    try {
        if (!process.env.OPENAI_KEY) {
            console.error('OPENAI_KEY is not configured');
            return NextResponse.json(
                { error: 'OpenAI API key is not configured' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const videoFile = formData.get('video');
        const sectionId = formData.get('sectionId');
        const courseId = formData.get('courseId');

        if (!videoFile) {
            return NextResponse.json(
                { error: 'No video file provided' },
                { status: 400 }
            );
        }

        if (!videoFile.type.startsWith('video/')) {
            return NextResponse.json(
                { error: 'File must be a video' },
                { status: 400 }
            );
        }

        const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (videoFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Video file too large. Maximum size is 2GB' },
                { status: 400 }
            );
        }

        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        const bytes = await videoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `video-${Date.now()}-${videoFile.name.replace(/\s/g, '-')}`;
        videoPath = path.join(uploadsDir, filename);

        await writeFile(videoPath, buffer);
        console.log(`Video saved temporarily at: ${videoPath}`);

        const quiz = await generateQuizFromVideo(videoPath, videoFile.name);

        // Convert the generated quiz to your quiz format
        const formattedQuiz = {
            title: quiz.title,
            description: `AI-generated quiz from video: ${videoFile.name}`,
            questions: quiz.questions.map((q, index) => ({
                question: q.question,
                options: q.options.map((option, optIndex) => ({
                    text: option,
                    isCorrect: option === q.correctAnswer
                })),
                points: 1
            })),
            passingMarks: 60,
            timeLimit: { hours: 0, minutes: 30, seconds: 0 },
            instructions: "This quiz was automatically generated from the video content.",
            allowRetake: true,
            maxAttempts: 3,
            shuffleQuestions: false,
            shuffleOptions: false,
            showResults: true,
            showCorrectAnswers: true,
            isFree: false
        };

        return NextResponse.json({
            success: true,
            quiz: formattedQuiz,
            message: 'Quiz generated successfully!'
        });

    } catch (error) {
        console.error('Error processing video:', error);

        if (videoPath && existsSync(videoPath)) {
            try {
                await unlink(videoPath);
                console.log('Cleaned up temporary file after error');
            } catch (cleanupError) {
                console.warn('Could not delete temporary file:', cleanupError.message);
            }
        }

        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

async function transcribeVideo(videoPath) {
    const audioPath = videoPath.replace(/\.[^/.]+$/, '.mp3');

    try {
        console.log("Extracting audio from video...");
        
        // Check if video has audio stream
        try {
            const { stdout } = await execPromise(`ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "${videoPath}"`);
            const hasAudio = stdout.trim().length > 0;
            
            if (!hasAudio) {
                throw new Error('Video file does not contain an audio stream. Please upload a video with audio.');
            }
            console.log("✅ Video has audio stream");
        } catch (probeError) {
            console.warn('Could not check for audio stream:', probeError.message);
        }
        
        // Extract audio
        await execPromise(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -ar 16000 -ac 1 -q:a 2 "${audioPath}" -y`);
        console.log("✅ Audio extracted successfully!");

        if (!existsSync(audioPath)) {
            throw new Error('Audio file was not created');
        }

        const stats = await stat(audioPath);
        if (stats.size === 0) {
            throw new Error('Extracted audio file is empty');
        }

        const fileStream = createReadStream(audioPath);
        
        const transcription = await openai.audio.transcriptions.create({
            file: fileStream,
            model: 'whisper-1',
            response_format: 'text'
        });

        await unlink(audioPath);
        console.log("Audio file cleaned up");
        
        return transcription;
    } catch (error) {
        console.error("Error in transcription:", error);
        
        if (existsSync(audioPath)) {
            try {
                await unlink(audioPath);
            } catch (cleanupError) {
                console.warn('Could not delete audio file:', cleanupError.message);
            }
        }
        
        if (error.message.includes('does not contain an audio stream')) {
            throw error;
        } else if (error.message.includes('Output file does not contain any stream')) {
            throw new Error('Video file has no audio track. Please upload a video with spoken content.');
        } else {
            throw new Error(`Transcription failed: ${error.message}`);
        }
    }
}

async function generateQuizFromTranscription(transcription, filename) {
    try {
        console.log('Generating quiz from transcription...');
        console.log('Transcription length:', transcription.length);

        const limitedTranscription = transcription.length > 4000 
            ? transcription.substring(0, 4000) + "... [content truncated]"
            : transcription;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are an expert educational quiz generator. 
                    Create comprehensive multiple choice quizzes based on video content.
                    Generate 5 questions with 4 options each that test understanding of key concepts.
                    Focus on main ideas, important details, and practical applications from the content.
                    Make questions educational and thought-provoking.
                    Ensure correct answers are accurate based on the content.
                    Return ONLY valid JSON format without any additional text or markdown.`
                },
                {
                    role: "user",
                    content: `Generate a quiz based on the following video transcription from "${filename}":
          
                    TRANSCRIPTION:
                    ${limitedTranscription}
          
                    Return ONLY JSON in this exact format:
                    {
                        "title": "Descriptive quiz title based on video content",
                        "questions": [
                            {
                                "question": "Clear and concise question text",
                                "options": ["Option A", "Option B", "Option C", "Option D"],
                                "correctAnswer": "Exact text of correct option",
                                "explanation": "Brief explanation of why this answer is correct based on video content"
                            }
                        ]
                    }
          
                    Requirements:
                    - Create 5 questions
                    - Each question must have 4 distinct options
                    - Questions should cover different aspects of the content
                    - Include both conceptual and detail-oriented questions
                    - Ensure answers are verifiable from the transcription
                    - Make explanations educational and helpful for learning
                    - Return ONLY JSON, no additional text`
                }
            ],
            temperature: 0.7,
            max_tokens: 3000
        });

        const quizContent = completion.choices[0].message.content;
        console.log('Raw AI response:', quizContent);

        let quizData;
        try {
            quizData = JSON.parse(quizContent);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON, trying to extract JSON...');
            const jsonMatch = quizContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    quizData = JSON.parse(jsonMatch[0]);
                    console.log('Successfully extracted JSON from response');
                } catch (extractError) {
                    console.error('Failed to parse extracted JSON:', extractError);
                    throw new Error('AI response is not valid JSON');
                }
            } else {
                console.error('No JSON found in AI response');
                throw new Error('AI response is not valid JSON');
            }
        }

        if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
            throw new Error('Invalid quiz structure from AI - missing title or questions array');
        }

        quizData.questions.forEach((q, index) => {
            if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer || !q.explanation) {
                throw new Error(`Invalid question structure at index ${index}. Each question must have: question, options array with 4 items, correctAnswer, and explanation`);
            }
        });

        console.log('Quiz validated successfully with', quizData.questions.length, 'questions');
        return quizData;

    } catch (error) {
        console.error('Error in quiz generation:', error);
        throw new Error(`Quiz generation failed: ${error.message}`);
    }
}

async function generateQuizFromVideo(videoPath, filename) {
    let transcription;

    try {
        console.log('Step 1: Starting video transcription...');
        transcription = await transcribeVideo(videoPath);
        console.log('Transcription completed, length:', transcription.length);

        if (!transcription || transcription.length < 50) {
            throw new Error('Transcription too short or unclear audio. Please ensure the video has clear spoken content.');
        }

        console.log('Step 2: Generating quiz from transcription...');
        const quiz = await generateQuizFromTranscription(transcription, filename);
        console.log('Quiz generation completed');

        if (existsSync(videoPath)) {
            await unlink(videoPath);
            console.log('Temporary video file deleted');
        }

        return quiz;

    } catch (error) {
        console.error('Error in generateQuizFromVideo:', error);
        
        if (existsSync(videoPath)) {
            try {
                await unlink(videoPath);
                console.log('Cleaned up temporary file after error');
            } catch (cleanupError) {
                console.warn('Could not delete temporary file during error cleanup:', cleanupError.message);
            }
        }

        throw error;
    }
}