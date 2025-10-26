import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  type: "multiple-choice" | "short-answer";
  isPractice: boolean;
  difficulty: "easy" | "medium" | "hard";
  title: string;
  passage: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
}

const AssessmentInterface = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes
  const [studentData, setStudentData] = useState<any>(null);
  const [assignedLevel, setAssignedLevel] = useState<"easy" | "medium" | "hard" | null>(null);
  const [practiceComplete, setPracticeComplete] = useState(false);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());

  useEffect(() => {
    const data = localStorage.getItem("studentData");
    if (!data) {
      navigate("/");
      return;
    }
    setStudentData(JSON.parse(data));

    // Timer countdown
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Sample questions - In real app, these would come from database/PDF extraction
  const practiceQuestions: Question[] = [
    {
      id: "p1",
      type: "multiple-choice",
      isPractice: true,
      difficulty: "medium",
      title: "Practice Question 1",
      passage: "Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, such as through variations in the solar cycle. But since the 1800s, human activities have been the main driver of climate change, primarily due to burning fossil fuels like coal, oil and gas.",
      question: "According to the passage, what has been the main driver of climate change since the 1800s?",
      options: [
        "Natural variations in the solar cycle",
        "Human activities, primarily burning fossil fuels",
        "Changes in ocean temperatures",
        "Volcanic eruptions"
      ],
      correctAnswer: "Human activities, primarily burning fossil fuels"
    },
    {
      id: "p2",
      type: "multiple-choice",
      isPractice: true,
      difficulty: "medium",
      title: "Practice Question 2",
      passage: "Photosynthesis is a process used by plants to convert light energy into chemical energy. During this process, plants take in carbon dioxide from the air and water from the soil. Using sunlight as energy, they convert these into glucose (a type of sugar) and oxygen. The oxygen is released back into the atmosphere.",
      question: "What do plants release into the atmosphere during photosynthesis?",
      options: [
        "Carbon dioxide",
        "Glucose",
        "Oxygen",
        "Water"
      ],
      correctAnswer: "Oxygen"
    },
    {
      id: "p3",
      type: "multiple-choice",
      isPractice: true,
      difficulty: "medium",
      title: "Practice Question 3",
      passage: "The water cycle describes how water evaporates from the surface of the earth, rises into the atmosphere, cools and condenses into rain or snow in clouds, and falls again to the surface as precipitation. The water that falls to Earth as precipitation can flow into rivers, lakes, and oceans, or it can seep into the ground to become groundwater.",
      question: "What happens to water after it evaporates from the Earth's surface?",
      options: [
        "It immediately falls as rain",
        "It rises into the atmosphere and condenses into clouds",
        "It becomes groundwater",
        "It flows into rivers and oceans"
      ],
      correctAnswer: "It rises into the atmosphere and condenses into clouds"
    }
  ];

  const mainQuestions: Record<"easy" | "medium" | "hard", Question[]> = {
    easy: [
      {
        id: "e1",
        type: "multiple-choice",
        isPractice: false,
        difficulty: "easy",
        title: "Reading Comprehension",
        passage: "The library is a place where books are kept for people to read or borrow. Libraries have existed for thousands of years. Ancient libraries stored information on clay tablets and papyrus scrolls. Today's libraries contain books, magazines, newspapers, and digital resources like computers and e-books. Many libraries also offer programs such as reading clubs, homework help, and community events.",
        question: "What is the main purpose of a library?",
        options: [
          "To sell books to people",
          "To keep books for people to read or borrow",
          "To store ancient clay tablets",
          "To organize community events only"
        ],
        correctAnswer: "To keep books for people to read or borrow"
      },
      {
        id: "e2",
        type: "multiple-choice",
        isPractice: false,
        difficulty: "easy",
        title: "Reading Comprehension",
        passage: "Bees are important insects that help plants grow. They do this through a process called pollination. When a bee visits a flower to drink nectar, pollen sticks to its body. As the bee moves from flower to flower, it transfers this pollen, helping plants produce seeds and fruit. Without bees, many plants would not be able to reproduce.",
        question: "How do bees help plants grow?",
        options: [
          "By eating the leaves",
          "By transferring pollen between flowers",
          "By watering the plants",
          "By protecting them from other insects"
        ],
        correctAnswer: "By transferring pollen between flowers"
      }
    ],
    medium: [
      {
        id: "m1",
        type: "multiple-choice",
        isPractice: false,
        difficulty: "medium",
        title: "Critical Reading",
        passage: "Artificial Intelligence (AI) is transforming industries worldwide. From healthcare to finance, AI systems can analyze vast amounts of data faster than humans. However, this technology also raises ethical concerns. Privacy issues arise when AI systems collect personal data. There are also fears about job displacement as machines take over tasks previously performed by humans. Despite these concerns, many experts believe that AI will ultimately benefit society if developed responsibly.",
        question: "What is one concern mentioned about AI in the passage?",
        options: [
          "AI cannot analyze data as well as humans",
          "AI systems raise privacy concerns",
          "AI is too expensive to implement",
          "AI cannot be used in healthcare"
        ],
        correctAnswer: "AI systems raise privacy concerns"
      }
    ],
    hard: [
      {
        id: "h1",
        type: "multiple-choice",
        isPractice: false,
        difficulty: "hard",
        title: "Advanced Analysis",
        passage: "Quantum computing represents a paradigm shift in computational capability. Unlike classical computers that process information in binary bits (0s and 1s), quantum computers use quantum bits or 'qubits' that can exist in multiple states simultaneously through superposition. This property, combined with quantum entanglement, allows quantum computers to solve certain problems exponentially faster than classical computers. However, quantum systems are extremely fragile and require near-absolute zero temperatures to function, making them impractical for everyday use currently.",
        question: "What makes quantum computers potentially more powerful than classical computers?",
        options: [
          "They operate at room temperature",
          "They use binary processing like classical computers",
          "Qubits can exist in multiple states simultaneously",
          "They are more affordable to manufacture"
        ],
        correctAnswer: "Qubits can exist in multiple states simultaneously"
      }
    ]
  };

  const getCurrentQuestions = () => {
    if (!practiceComplete) {
      return practiceQuestions;
    }
    return mainQuestions[assignedLevel || "medium"];
  };

  const questions = getCurrentQuestions();

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const updatedAnswers = { ...answers, [currentQuestion]: answer };
    setAnswers(updatedAnswers);

    // Check if practice phase is complete
    if (!practiceComplete && currentQuestion === practiceQuestions.length - 1) {
      const practiceScore = calculatePracticeScore(updatedAnswers);
      assignDifficultyLevel(practiceScore);
    }
  };

  const calculatePracticeScore = (practiceAnswers: Record<number, string>) => {
    let correct = 0;
    practiceQuestions.forEach((q, idx) => {
      if (practiceAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    return (correct / practiceQuestions.length) * 100;
  };

  const assignDifficultyLevel = (score: number) => {
    let level: "easy" | "medium" | "hard";
    if (score >= 75) {
      level = "hard";
    } else if (score >= 50) {
      level = "medium";
    } else {
      level = "easy";
    }
    setAssignedLevel(level);
    setPracticeComplete(true);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    
    toast({
      title: "Practice Complete!",
      description: `Moving to ${level} difficulty questions`,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || "");
    } else if (!practiceComplete) {
      // Moving from practice to main questions
      setCurrentQuestion(0);
      setSelectedAnswer("");
    } else {
      handleSubmit();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || "");
    }
  };

  const handleSubmit = () => {
    // Calculate score
    const questions = getCurrentQuestions();
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    const score = Math.round((correct / questions.length) * 100);

    // Get current test info
    const currentTest = JSON.parse(localStorage.getItem("currentTest") || "{}");
    
    const result = {
      studentId: studentData.studentId,
      testCode: currentTest.testCode || "DEMO",
      testTitle: currentTest.title || "Demo Test",
      subject: studentData.subject,
      score,
      difficultyLevel: assignedLevel,
      timeSpent: 3600 - timeRemaining,
      completedAt: new Date().toISOString(),
      answers,
      markedForReview: Array.from(markedForReview)
    };
    
    // Save to test results
    const testResults = JSON.parse(localStorage.getItem("testResults") || "[]");
    testResults.push(result);
    localStorage.setItem("testResults", JSON.stringify(testResults));
    
    // Clear current test
    localStorage.removeItem("currentTest");
    
    toast({
      title: "Assessment Complete!",
      description: `Your score: ${score}%`,
    });
    
    navigate("/student/dashboard");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!studentData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      {/* Top Cloud Bubble - Header */}
      <div className="sticky top-4 z-50 mx-4 mt-4">
        <div className="cloud-bubble-top px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">ASD Benchmark Assessment</h2>
                <p className="text-xs text-muted-foreground">
                  {practiceComplete ? `${assignedLevel?.toUpperCase()} Level` : "Practice Questions"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Timer */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono font-semibold text-foreground">{formatTime(timeRemaining)}</span>
              </div>

              {/* Question Navigation Bubbles */}
              <div className="flex items-center gap-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQuestion(idx);
                      setSelectedAnswer(answers[idx] || "");
                    }}
                    className={`question-nav-bubble relative ${
                      idx === currentQuestion ? "active" : answers[idx] ? "answered" : "unanswered"
                    }`}
                  >
                    {idx + 1}
                    {markedForReview.has(idx) && (
                      <Flag className="h-3 w-3 absolute -top-1 -right-1 fill-yellow-500 text-yellow-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Middle Cloud Bubble */}
      <div className="container mx-auto px-4 py-8">
        <div className="cloud-bubble-main p-6">
          <div className="grid lg:grid-cols-5 gap-6 min-h-[calc(100vh-200px)]">
            {/* Left Panel - Reading Passage (60%) */}
            <div className="lg:col-span-3">
              <div className="passage-bubble">
                <div className="mb-4 pb-4 border-b border-border">
                  <h2 className="text-xl font-semibold text-foreground">Reading Passage</h2>
                  <p className="text-sm text-muted-foreground mt-1">{questions[currentQuestion].title}</p>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  {questions[currentQuestion].passage.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 text-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Question & Answers (40%) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="question-bubble">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      Question {currentQuestion + 1} of {questions.length}
                    </span>
                    {practiceComplete && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {questions[currentQuestion].difficulty.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mt-4">
                    {questions[currentQuestion].question}
                  </h3>
                </div>

                <div className="space-y-3">
                  {questions[currentQuestion].options?.map((option, idx) => (
                    <label
                      key={idx}
                      className={`answer-card ${selectedAnswer === option ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={selectedAnswer === option}
                        onChange={() => handleAnswerSelect(option)}
                        className="sr-only"
                      />
                      <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-muted-foreground flex items-center justify-center transition-colors">
                        {selectedAnswer === option && (
                          <div className="w-3.5 h-3.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-sm text-foreground leading-snug">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mark for Review */}
              <Button
                variant="outline"
                onClick={() => {
                  const newMarked = new Set(markedForReview);
                  if (newMarked.has(currentQuestion)) {
                    newMarked.delete(currentQuestion);
                    toast({ title: "Unmarked", description: "Question removed from review list" });
                  } else {
                    newMarked.add(currentQuestion);
                    toast({ title: "Marked for Review", description: "Question added to review list" });
                  }
                  setMarkedForReview(newMarked);
                }}
                className="w-full"
              >
                <Flag className={`h-4 w-4 mr-2 ${markedForReview.has(currentQuestion) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                {markedForReview.has(currentQuestion) ? 'Marked for Review' : 'Mark for Review'}
              </Button>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center gap-4">
                <Button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestion === 0}
                  className="nav-btn-prev flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                {currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={practiceComplete ? handleSubmit : handleNextQuestion}
                    className="nav-btn-next flex-1"
                  >
                    {practiceComplete ? "Submit" : "Continue"}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="nav-btn-next flex-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentInterface;