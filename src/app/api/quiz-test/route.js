import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync, createReadStream ,createWriteStream} from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import OpenAI from 'openai';
import { stat } from 'fs/promises';
import https from 'https';
import http from 'http';

const execPromise = promisify(exec);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

async function downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const fileStream = createWriteStream(filePath);
        
        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download file: ${response.statusCode}`));
                return;
            }
            
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            
            fileStream.on('error', (err) => {
                unlink(filePath).catch(() => {});
                reject(err);
            });
            
        }).on('error', (err) => {
            unlink(filePath).catch(() => {});
            reject(err);
        });
    });
}

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
        const videoUrl = formData.get('videoUrl');
        const filename = formData.get('filename');
        const sectionId = formData.get('sectionId');
        const courseId = formData.get('courseId');

        if (!videoFile && !videoUrl) {
            return NextResponse.json(
                { error: 'No video file or URL provided' },
                { status: 400 }
            );
        }

        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        if (videoFile) {
            if (!videoFile.type.startsWith('video/')) {
                return NextResponse.json(
                    { error: 'File must be a video' },
                    { status: 400 }
                );
            }

            const maxSize = 2 * 1024 * 1024 * 1024; 
            if (videoFile.size > maxSize) {
                return NextResponse.json(
                    { error: 'Video file too large. Maximum size is 2GB' },
                    { status: 400 }
                );
            }

            const bytes = await videoFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const generatedFilename = `video-${Date.now()}-${videoFile.name.replace(/\s/g, '-')}`;
            videoPath = path.join(uploadsDir, generatedFilename);
            await writeFile(videoPath, buffer);
            
        } else if (videoUrl) {
            const generatedFilename = `video-${Date.now()}-${filename || 'video'}.mp4`;
            videoPath = path.join(uploadsDir, generatedFilename);
            await downloadFile(videoUrl, videoPath);
        }

        const stats = await stat(videoPath);
        if (stats.size === 0) {
            throw new Error('Video file is empty or invalid');
        }

        const finalFilename = filename || videoFile?.name || 'video';
        const quiz = await generateQuizFromVideo(videoPath, finalFilename);

        const formattedQuiz = {
            title: quiz.title,
            description: `AI-generated quiz from video: ${finalFilename}`,
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
        
        try {
            const { stdout } = await execPromise(`ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "${videoPath}"`);
            const hasAudio = stdout.trim().length > 0;
            
            if (!hasAudio) {
                throw new Error('Video file does not contain an audio stream. Please upload a video with audio.');
            }
        } catch (probeError) {
            console.warn('Could not check for audio stream:', probeError.message);
        }
        
        await execPromise(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -ar 16000 -ac 1 -q:a 2 "${audioPath}" -y`);

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

        if (transcription.length < 100) {
            throw new Error('Transcription is too short to generate a meaningful quiz. Please ensure the video has clear spoken content.');
        }

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

        let quizData;
        try {
            quizData = JSON.parse(quizContent);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON, trying to extract JSON...');
            const jsonMatch = quizContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    quizData = JSON.parse(jsonMatch[0]);
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

        // Validate each question
        quizData.questions.forEach((q, index) => {
            if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer || !q.explanation) {
                throw new Error(`Invalid question structure at index ${index}. Each question must have: question, options array with 4 items, correctAnswer, and explanation`);
            }

            // Validate that correctAnswer matches one of the options
            if (!q.options.includes(q.correctAnswer)) {
                throw new Error(`Correct answer "${q.correctAnswer}" not found in options for question ${index + 1}`);
            }
        });

        return quizData;

    } catch (error) {
        console.error('Error in quiz generation:', error);
        throw new Error(`Quiz generation failed: ${error.message}`);
    }
}

async function generateQuizFromVideo(videoPath, filename) {
    let transcription;

    try {
        transcription = await transcribeVideo(videoPath);

        if (!transcription || transcription.length < 50) {
            throw new Error('Transcription too short or unclear audio. Please ensure the video has clear spoken content.');
        }

        const quiz = await generateQuizFromTranscription(transcription, filename);

        if (existsSync(videoPath)) {
            await unlink(videoPath);
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