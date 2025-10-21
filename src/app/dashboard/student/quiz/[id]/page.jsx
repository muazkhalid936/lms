import React from "react";
import QuizTakingPage from "@/components/dashboard/QuizTakingPage";

const QuizPage = async ({ params }) => {
  const { id } = await params;
  return <QuizTakingPage quizId={id} />;
};

export default QuizPage;