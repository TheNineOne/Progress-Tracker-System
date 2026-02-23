import { useState } from 'react';
import {
  MessageSquare,
  Play,
  Send,
  Loader2,
  History,
  RefreshCw,
  Star,
  AlertCircle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';
import { generateInterviewQuestion, evaluateAnswer } from '../../services/aiService';
import type { InterviewFeedback } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const roles = [
  { value: 'Core Java', label: 'Core Java', icon: '☕' },
  { value: 'Advanced Java', label: 'Advanced Java', icon: '🚀' },
  { value: 'Spring Boot', label: 'Spring Boot', icon: '🍃' },
  { value: 'Node.js & Express', label: 'Node.js & Express', icon: '🟢' },
  { value: 'React Frontend', label: 'React Frontend', icon: '⚛️' },
  { value: 'SQL Database', label: 'SQL Database', icon: '🛢️' },
  { value: 'Networking', label: 'Networking', icon: '🌐' },
];

export function InterviewLab() {
  const { isDarkMode, interviewSessions, addInterviewSession } = useAppStore();
  const [selectedRole, setSelectedRole] = useState('Core Java');
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleGenerateQuestion = async () => {
    setIsLoadingQuestion(true);
    setCurrentQuestion(null);
    setFeedback(null);
    setUserAnswer('');

    const question = await generateInterviewQuestion(selectedRole);
    setCurrentQuestion(question);
    setIsLoadingQuestion(false);
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;

    setIsEvaluating(true);
    const result = await evaluateAnswer(currentQuestion, userAnswer, selectedRole);
    setFeedback(result);
    setIsEvaluating(false);

    // Save to history
    addInterviewSession({
      id: uuidv4(),
      role: selectedRole,
      question: currentQuestion,
      userAnswer,
      feedback: result,
      timestamp: new Date(),
    });
  };

  const ScoreCard = ({ label, score, maxScore = 10 }: { label: string; score: number; maxScore?: number }) => {
    const percentage = (score / maxScore) * 100;
    const getColor = () => {
      if (percentage >= 80) return 'text-emerald-500 bg-emerald-500';
      if (percentage >= 60) return 'text-amber-500 bg-amber-500';
      return 'text-red-500 bg-red-500';
    };

    return (
      <div className={cn(
        "p-4 rounded-xl border",
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className={cn(
            "text-sm font-medium",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>{label}</span>
          <span className={cn("font-bold text-lg", getColor().split(' ')[0])}>
            {score}/{maxScore}
          </span>
        </div>
        <div className={cn(
          "h-2 rounded-full overflow-hidden",
          isDarkMode ? "bg-gray-700" : "bg-gray-200"
        )}>
          <div
            className={cn("h-full rounded-full transition-all duration-500", getColor().split(' ')[1])}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(
            "text-3xl font-bold flex items-center gap-3",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            <MessageSquare className="w-8 h-8 text-violet-500" />
            Smart Interview Simulator
          </h1>
          <p className={cn(
            "mt-1",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>AI-powered interview practice with instant feedback</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all",
            showHistory
              ? "bg-violet-600 text-white"
              : isDarkMode
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          <History className="w-5 h-5" />
          History ({interviewSessions.length})
        </button>
      </div>

      {showHistory ? (
        /* History View */
        <div className={cn(
          "p-6 rounded-2xl border",
          isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
        )}>
          <h2 className={cn(
            "text-xl font-bold mb-4",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>Interview History</h2>
          {interviewSessions.length === 0 ? (
            <div className={cn(
              "text-center py-12",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No interview sessions yet. Start practicing!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interviewSessions.slice(0, 10).map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "p-4 rounded-xl border",
                    isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      isDarkMode ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-700"
                    )}>{session.role}</span>
                    <span className={cn(
                      "text-xs",
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    )}>
                      {new Date(session.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={cn(
                    "font-medium mb-2",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>{session.question}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      Clarity: {session.feedback.clarityScore}/10
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-violet-500" />
                      Technical: {session.feedback.technicalDepthScore}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Interview Practice View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Question & Answer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Role Selection */}
            <div className={cn(
              "p-6 rounded-2xl border",
              isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
            )}>
              <h2 className={cn(
                "text-lg font-bold mb-4",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>Select Your Role</h2>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-200",
                      selectedRole === role.value
                        ? "border-violet-500 bg-violet-500/10"
                        : isDarkMode
                          ? "border-gray-700 hover:border-gray-600"
                          : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <span className="text-2xl mb-2 block">{role.icon}</span>
                    <span className={cn(
                      "font-medium text-sm",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>{role.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleGenerateQuestion}
                disabled={isLoadingQuestion}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50"
              >
                {isLoadingQuestion ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : currentQuestion ? (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    New Question
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Interview
                  </>
                )}
              </button>
            </div>

            {/* Question Display */}
            {currentQuestion && (
              <div className={cn(
                "p-6 rounded-2xl border",
                isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
              )}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>Interview Question</span>
                    <p className={cn(
                      "text-lg font-medium mt-1",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>{currentQuestion}</p>
                  </div>
                </div>

                {/* Answer Input */}
                <div className="mt-6">
                  <label className={cn(
                    "block text-sm font-medium mb-2",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>Your Answer</label>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here... Be detailed and explain your thought process."
                    rows={6}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none",
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                    )}
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim() || isEvaluating}
                    className="mt-4 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Answer
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Feedback */}
          <div className="space-y-6">
            {feedback ? (
              <>
                {/* Scores */}
                <div className="space-y-3">
                  <ScoreCard label="Clarity Score" score={feedback.clarityScore} />
                  <ScoreCard label="Technical Depth" score={feedback.technicalDepthScore} />
                </div>

                {/* Overall Feedback */}
                <div className={cn(
                  "p-4 rounded-xl border",
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className={cn(
                      "font-medium",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>Overall Feedback</span>
                  </div>
                  <p className={cn(
                    "text-sm",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>{feedback.overallFeedback}</p>
                </div>

                {/* Missing Concepts */}
                <div className={cn(
                  "p-4 rounded-xl border",
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className={cn(
                      "font-medium",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>Areas to Improve</span>
                  </div>
                  <ul className="space-y-2">
                    {feedback.missingConcepts.map((concept, idx) => (
                      <li
                        key={idx}
                        className={cn(
                          "text-sm flex items-start gap-2",
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        )}
                      >
                        <span className="text-amber-500 mt-0.5">•</span>
                        {concept}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Answer */}
                <div className={cn(
                  "p-4 rounded-xl border",
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-violet-500" />
                    <span className={cn(
                      "font-medium",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>Suggested Answer</span>
                  </div>
                  <p className={cn(
                    "text-sm",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>{feedback.suggestedAnswer}</p>
                </div>
              </>
            ) : (
              <div className={cn(
                "p-8 rounded-2xl border text-center",
                isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
              )}>
                <MessageSquare className={cn(
                  "w-12 h-12 mx-auto mb-3",
                  isDarkMode ? "text-gray-600" : "text-gray-300"
                )} />
                <p className={cn(
                  "font-medium mb-1",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>AI Feedback</p>
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                )}>Submit your answer to receive detailed feedback</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
