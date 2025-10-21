export const lecturesData = {
  title: "Lecture List",
  totalLectures: 92,
  totalDuration: "10:56:11",
  sections: [
    {
      title: "Getting Started",
      lectures: [
        {
          title: "Lecture 1.1 Introduction to the User Experience Course",
          duration: "02:53",
          hasPreview: true,
        },
        {
          title: "Lecture 1.1 Introduction to the User Experience Course",
          duration: "02:53",
          hasPreview: true,
        },
        {
          title: "Lecture 1.1 Introduction to the User Experience Course",
          duration: "02:53",
          hasPreview: true,
        },
        {
          title: "Lecture 1.1 Introduction to the User Experience Course",
          duration: "02:53",
          hasPreview: true,
        },
        {
          title: "Lecture 1.1 Introduction to the User Experience Course",
          duration: "02:53",
          hasPreview: true,
        },
      ],
    },
    {
      title: "The Brief",
      lectures: [
        {
          title: "Understanding Project Requirements",
          duration: "05:20",
          hasPreview: false,
        },
        {
          title: "Client Communication Best Practices",
          duration: "03:45",
          hasPreview: true,
        },
      ],
    },
    {
      title: "Wireframing Low Fidelity",
      lectures: [
        {
          title: "Introduction to Low Fidelity Wireframes",
          duration: "04:12",
          hasPreview: false,
        },
        {
          title: "Tools and Techniques",
          duration: "06:30",
          hasPreview: true,
        },
      ],
    },
    {
      title: "Type, Color & Icon Introduction",
      lectures: [
        {
          title: "Typography Fundamentals",
          duration: "07:15",
          hasPreview: false,
        },
        {
          title: "Color Theory for UI Design",
          duration: "05:45",
          hasPreview: true,
        },
        {
          title: "Icon Systems and Guidelines",
          duration: "04:20",
          hasPreview: false,
        },
      ],
    },
  ],
};

export const supportingData = [
  {
    title: "Introduction",
    files: [
      { name: "Introduction_to_modern_web_dev_fundamentals_2025.pdf" },
      { name: "Introduction_to_modern_web_dev_fundamentals_2025.pdf" },
      { name: "Introduction_to_modern_web_dev_fundamentals_2025.pdf" },
      { name: "Introduction_to_modern_web_dev_fundamentals_2025.pdf" },
      { name: "Introduction_to_modern_web_dev_fundamentals_2025.pdf" },
    ],
  },
  {
    title: "Technologies and Tools",
    files: [
      { name: "Technologies_and_tools_guide_2025.pdf" },
      { name: "Setup_instructions.pdf" },
    ],
  },
  {
    title: "Implementation Details",
    files: [
      { name: "Implementation_best_practices.pdf" },
      { name: "Code_examples.zip" },
    ],
  },
  {
    title: "Conclusion",
    files: [
      { name: "Summary_and_next_steps.pdf" },
      { name: "Additional_resources.pdf" },
    ],
  },
];

export const classes = [
  {
    id: "1",
    title: "Essential Concepts in Web Development",
    description: "Learn the building blocks of the web",
    date: "22 Aug 2025",
    time: "2:00 PM",
    duration: "2h 30min",
  },
  {
    id: "2",
    title: "Advanced React Patterns and Best Practices",
    description: "Master modern React development techniques",
    date: "24 Aug 2025",
    time: "10:00 AM",
    duration: "3h",
  },
  {
    id: "3",
    title: "UI/UX Design Fundamentals",
    description: "Create stunning user interfaces and experiences",
    date: "22 Sep 2025",
    time: "4:00 PM",
    duration: "2h",
  },
  {
    id: "4",
    title: "JavaScript ES6+ Features Deep Dive",
    description: "Explore modern JavaScript features and syntax",
    date: "22 Dec 2025",
    time: "11:00 AM",
    duration: "2h 45min",
  },
  {
    id: "5",
    title: "Database Design and Management",
    description: "Learn to design efficient database schemas",
    date: "22 Aug 2025",
    time: "1:00 PM",
    duration: "2h 15min",
  },
  {
    id: "6",
    title: "Mobile App Development with React Native",
    description: "Build cross-platform mobile applications",
    date: "22 Aug 2026",
    time: "3:00 PM",
    duration: "3h 30min",
  },
  {
    id: "7",
    title: "Cloud Deployment Strategies",
    description: "Deploy applications to cloud platforms",
    date: "22 Aug 2027",
    time: "9:00 AM",
    duration: "2h",
  },
  {
    id: "8",
    title: "API Development and Integration",
    description: "Create and integrate RESTful APIs",
    date: "21 Aug 2025",
    time: "2:30 PM",
    duration: "2h 45min",
  },
];

export const sampleQuizzes = [
  {
    id: 1,
    title: "Information About UI/UX Design Degree",
    questionCount: 5,
    duration: 180, // 3 minutes in seconds
    thumbnailImage: "/course/thumb1.png",
    questions: [
      {
        id: 1,
        question: "What does UI stand for?",
        options: [
          "User Intention",
          "User Interface",
          "Universal Interaction",
          "Usability Information",
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: "Which principle is most important in UX design?",
        options: [
          "Visual Appeal",
          "User-Centered Design",
          "Technical Complexity",
          "Brand Consistency",
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        question: "What is a wireframe in UI/UX design?",
        options: [
          "A final design mockup",
          "A low-fidelity structural blueprint",
          "A color palette guide",
          "A typography specification",
        ],
        correctAnswer: 1,
      },
      {
        id: 4,
        question: "Which tool is commonly used for prototyping?",
        options: ["Microsoft Word", "Adobe Photoshop", "Figma", "Excel"],
        correctAnswer: 2,
      },
      {
        id: 5,
        question: "What does 'responsive design' mean?",
        options: [
          "Fast loading websites",
          "Interactive animations",
          "Design that adapts to different screen sizes",
          "Immediate user feedback",
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: 2,
    title: "JavaScript Fundamentals Quiz",
    questionCount: 4,
    duration: 240,
    thumbnailImage: "⚡",
    questions: [
      {
        id: 1,
        question:
          "What is the correct way to declare a variable in JavaScript?",
        options: [
          "var myVar;",
          "variable myVar;",
          "declare myVar;",
          "v myVar;",
        ],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: "Which method is used to add an element to an array?",
        options: ["add()", "append()", "push()", "insert()"],
        correctAnswer: 2,
      },
      {
        id: 3,
        question: "What does '===' operator do in JavaScript?",
        options: [
          "Assignment",
          "Loose equality comparison",
          "Strict equality comparison",
          "Not equal comparison",
        ],
        correctAnswer: 2,
      },
      {
        id: 4,
        question: "Which is NOT a JavaScript data type?",
        options: ["String", "Boolean", "Float", "Undefined"],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: 3,
    title: "React Components & Hooks",
    questionCount: 6,
    duration: 300,
    thumbnailImage: "⚛️",
    questions: [
      {
        id: 1,
        question: "What is a React Hook?",
        options: [
          "A function that lets you hook into React features",
          "A method to create components",
          "A way to style components",
          "A debugging tool",
        ],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: "Which Hook is used for state management?",
        options: ["useEffect", "useState", "useContext", "useReducer"],
        correctAnswer: 1,
      },
      {
        id: 3,
        question: "What is JSX?",
        options: [
          "A JavaScript library",
          "A syntax extension for JavaScript",
          "A CSS framework",
          "A testing tool",
        ],
        correctAnswer: 1,
      },
      {
        id: 4,
        question: "When does useEffect run by default?",
        options: [
          "Only on mount",
          "Only on unmount",
          "After every render",
          "Never automatically",
        ],
        correctAnswer: 2,
      },
      {
        id: 5,
        question: "What is the purpose of keys in React lists?",
        options: [
          "Styling elements",
          "Event handling",
          "Helping React identify which items have changed",
          "Data validation",
        ],
        correctAnswer: 2,
      },
      {
        id: 6,
        question:
          "Which method is used to update state in functional components?",
        options: [
          "this.setState()",
          "updateState()",
          "The setter function from useState",
          "state.update()",
        ],
        correctAnswer: 2,
      },
    ],
  },
];

export const sampleCourses = [
  {
    id: 1,
    name: "Information About Photoshop Design Degree",
    lessons: 11,
    quizzes: 2,
    duration: "03:15:00",
    studentsEnrolled: 400,
    price: 220,
    ratings: { score: 4.8, count: 180 },
    status: "published",
  },
  {
    id: 2,
    name: "Information About Photoshop Design Degree",
    lessons: 11,
    quizzes: 2,
    duration: "03:15:00",
    studentsEnrolled: 400,
    price: 220,
    ratings: { score: 4.8, count: 180 },
    status: "published",
  },
  {
    id: 3,
    name: "Information About Photoshop Design Degree",
    lessons: 11,
    quizzes: 2,
    duration: "03:15:00",
    studentsEnrolled: 400,
    price: 220,
    ratings: { score: 4.8, count: 180 },
    status: "pending",
  },
  {
    id: 4,
    name: "Information About Photoshop Design Degree",
    lessons: 11,
    quizzes: 2,
    duration: "03:15:00",
    studentsEnrolled: 400,
    price: 220,
    ratings: { score: 4.8, count: 180 },
    status: "published",
  },
  {
    id: 5,
    name: "Information About Photoshop Design Degree",
    lessons: 11,
    quizzes: 2,
    duration: "03:15:00",
    studentsEnrolled: 400,
    price: 220,
    ratings: { score: 4.8, count: 180 },
    status: "draft",
  },
  {
    id: 6,
    name: "Information About Photoshop Design Degree",
    lessons: 11,
    quizzes: 2,
    duration: "03:15:00",
    studentsEnrolled: 400,
    price: 220,
    ratings: { score: 4.8, count: 180 },
    status: "published",
  },
  {
    id: 7,
    name: "Information About Photoshop Design Degree",
    lessons: 11,
    quizzes: 2,
    duration: "03:15:00",
    studentsEnrolled: 400,
    price: 220,
    ratings: { score: 4.8, count: 180 },
    status: "published",
  },
  {
    id: 8,
    name: "Information About Photoshop Design Degree",
    lessons: 11,
    quizzes: 2,
    duration: "03:15:00",
    studentsEnrolled: 400,
    price: 220,
    ratings: { score: 4.8, count: 180 },
    status: "published",
  },
  {
    id: 9,
    name: "Information About Photoshop Design Degree",
    lessons: 11,
    quizzes: 2,
    duration: "03:15:00",
    studentsEnrolled: 400,
    price: 220,
    ratings: { score: 4.8, count: 180 },
    status: "published",
  },
  {
    id: 10,
    name: "Information About Photoshop Design Degree",
    lessons: 11,
    quizzes: 2,
    duration: "03:15:00",
    studentsEnrolled: 400,
    price: 220,
    ratings: { score: 4.8, count: 180 },
    status: "published",
  },
];

export const sampleCertificates = [
  {
    id: "cert-001",
    name: "UI/UX Design Certificate",
    date: "2025-08-22",
    marks: 20,
    outOf: 20,
  },
  {
    id: "cert-002",
    name: "UI/UX Design Certificate",
    date: "2025-08-22",
    marks: 20,
    outOf: 20,
  },
  {
    id: "cert-003",
    name: "UI/UX Design Certificate",
    date: "2025-08-22",
    marks: 20,
    outOf: 20,
  },
  {
    id: "cert-004",
    name: "UI/UX Design Certificate",
    date: "2025-08-22",
    marks: 20,
    outOf: 20,
  },
  {
    id: "cert-005",
    name: "UI/UX Design Certificate",
    date: "2025-08-22",
    marks: 20,
    outOf: 20,
  },
  {
    id: "cert-006",
    name: "UI/UX Design Certificate",
    date: "2025-08-22",
    marks: 20,
    outOf: 20,
  },
  {
    id: "cert-007",
    name: "React Development Certificate",
    date: "2025-07-15",
    marks: 18,
    outOf: 20,
  },
  {
    id: "cert-008",
    name: "WordPress Mastery Certificate",
    date: "2025-06-10",
    marks: 19,
    outOf: 20,
  },
];
