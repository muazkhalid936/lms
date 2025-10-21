import React from 'react';

const ActiveQuiz = ({ 
  quiz,
  onContinue
}) => {
  const progressPercentage = Math.round((quiz.answered / quiz.total) * 100);
  
  return (
    <div className="w-full mx-auto pb-4">
      <div 
        className="relative rounded-[10px] p-6 md:px-8 md:py-2 overflow-hidden border border-[var(--gray-100)]"
        style={{
          backgroundImage: "url('/dashboard/student/bg_quiz.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        
        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-[16px] font-bold text-[var(--gray-900)] mb-2">
              Quiz : {quiz.name}
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-[var(--gray-900)] text-[14px]">
                Answered : {quiz.answered}/{quiz.total}
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <button 
              onClick={onContinue}
              className="w-full rounded-[800px] text-[14px] cursor-pointer md:w-auto bg-[var(--indigo-900)] hover:bg-indigo-700 text-white font-semibold py-3 px-6 md:py-2 md:px-4 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {quiz.answered === quiz.total ? 'Review Quiz' : 'Continue Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ActiveQuiz;