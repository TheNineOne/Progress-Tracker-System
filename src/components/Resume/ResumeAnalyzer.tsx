import { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  Award,
  History,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';
import { analyzeResume } from '../../services/aiService';
import type { ResumeAnalysis } from '../../types';

export function ResumeAnalyzer() {
  const { isDarkMode, resumeAnalyses, addResumeAnalysis } = useAppStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ResumeAnalysis | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [resumeText, setResumeText] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    // Simulate file reading
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string || generateSampleResumeText();
      setResumeText(text);
      
      const analysis = await analyzeResume(text, file.name);
      setCurrentAnalysis(analysis);
      addResumeAnalysis(analysis);
      setIsAnalyzing(false);
    };
    reader.onerror = async () => {
      // Fallback to sample text
      const text = generateSampleResumeText();
      setResumeText(text);
      const analysis = await analyzeResume(text, file.name);
      setCurrentAnalysis(analysis);
      addResumeAnalysis(analysis);
      setIsAnalyzing(false);
    };
    reader.readAsText(file);
  };

  const handleTextAnalysis = async () => {
    if (!resumeText.trim()) return;
    
    setIsAnalyzing(true);
    const analysis = await analyzeResume(resumeText, 'pasted-resume.txt');
    setCurrentAnalysis(analysis);
    addResumeAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const generateSampleResumeText = () => {
    return `
      John Doe - Software Developer
      Experience: 3 years
      Skills: Java, Spring Boot, SQL, REST APIs, Git
      Education: Bachelor in Computer Science
      Projects: Built microservices architecture, E-commerce platform
      Certifications: AWS Certified Developer
    `;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-600';
    if (score >= 60) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
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
            <FileText className="w-8 h-8 text-emerald-500" />
            Resume Analyzer
          </h1>
          <p className={cn(
            "mt-1",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>AI-powered resume analysis with career recommendations</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all",
            showHistory
              ? "bg-emerald-600 text-white"
              : isDarkMode
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          <History className="w-5 h-5" />
          History ({resumeAnalyses.length})
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
          )}>Analysis History</h2>
          {resumeAnalyses.length === 0 ? (
            <div className={cn(
              "text-center py-12",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No analyses yet. Upload a resume to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {resumeAnalyses.map((analysis) => (
                <button
                  key={analysis.id}
                  onClick={() => {
                    setCurrentAnalysis(analysis);
                    setShowHistory(false);
                  }}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all hover:scale-[1.01]",
                    isDarkMode 
                      ? "bg-gray-700/50 border-gray-600 hover:border-emerald-500" 
                      : "bg-gray-50 border-gray-200 hover:border-emerald-500"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={cn(
                        "font-medium",
                        isDarkMode ? "text-white" : "text-gray-900"
                      )}>{analysis.fileName}</h3>
                      <p className={cn(
                        "text-sm mt-1",
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      )}>
                        {new Date(analysis.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "text-2xl font-bold",
                        getScoreColor(analysis.atsScore)
                      )}>
                        {analysis.atsScore}%
                      </div>
                      <ChevronRight className={cn(
                        "w-5 h-5",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload & Input */}
          <div className="space-y-6">
            {/* Upload Section */}
            <div className={cn(
              "p-6 rounded-2xl border",
              isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
            )}>
              <h2 className={cn(
                "text-lg font-bold mb-4",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>Upload Resume</h2>
              
              <label className={cn(
                "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-emerald-500",
                isDarkMode ? "border-gray-600 bg-gray-700/30" : "border-gray-300 bg-gray-50"
              )}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-3" />
                    <p className={cn(
                      "font-medium",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>Analyzing...</p>
                  </>
                ) : (
                  <>
                    <Upload className={cn(
                      "w-12 h-12 mb-3",
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    )} />
                    <p className={cn(
                      "font-medium",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>Drop your resume here</p>
                    <p className={cn(
                      "text-sm mt-1",
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    )}>or click to upload (PDF, DOCX, TXT)</p>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isAnalyzing}
                />
              </label>
            </div>

            {/* Text Input */}
            <div className={cn(
              "p-6 rounded-2xl border",
              isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
            )}>
              <h2 className={cn(
                "text-lg font-bold mb-4",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>Or Paste Text</h2>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here..."
                rows={8}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none",
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                )}
              />
              <button
                onClick={handleTextAnalysis}
                disabled={!resumeText.trim() || isAnalyzing}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    Analyze Resume
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 space-y-6">
            {currentAnalysis ? (
              <>
                {/* ATS Score */}
                <div className={cn(
                  "p-6 rounded-2xl border",
                  isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className={cn(
                        "text-xl font-bold",
                        isDarkMode ? "text-white" : "text-gray-900"
                      )}>ATS Compatibility Score</h2>
                      <p className={cn(
                        "text-sm mt-1",
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      )}>{currentAnalysis.fileName}</p>
                    </div>
                    <div className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br",
                      getScoreGradient(currentAnalysis.atsScore)
                    )}>
                      <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center",
                        isDarkMode ? "bg-gray-800" : "bg-white"
                      )}>
                        <span className={cn(
                          "text-3xl font-bold",
                          getScoreColor(currentAnalysis.atsScore)
                        )}>
                          {currentAnalysis.atsScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={cn(
                    "h-4 rounded-full overflow-hidden",
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  )}>
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 bg-gradient-to-r",
                        getScoreGradient(currentAnalysis.atsScore)
                      )}
                      style={{ width: `${currentAnalysis.atsScore}%` }}
                    />
                  </div>
                </div>

                {/* Grid of Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className={cn(
                    "p-6 rounded-2xl border",
                    isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
                  )}>
                    <h3 className={cn(
                      "font-bold mb-3 flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {currentAnalysis.strengths.map((strength, idx) => (
                        <li 
                          key={idx}
                          className={cn(
                            "flex items-center gap-2 text-sm",
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          )}
                        >
                          <span className="text-emerald-500">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Keywords */}
                  <div className={cn(
                    "p-6 rounded-2xl border",
                    isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
                  )}>
                    <h3 className={cn(
                      "font-bold mb-3 flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentAnalysis.missingKeywords.map((keyword, idx) => (
                        <span 
                          key={idx}
                          className={cn(
                            "px-3 py-1 rounded-full text-sm",
                            isDarkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"
                          )}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skill Gaps */}
                  <div className={cn(
                    "p-6 rounded-2xl border",
                    isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
                  )}>
                    <h3 className={cn(
                      "font-bold mb-3 flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>
                      <TrendingUp className="w-5 h-5 text-violet-500" />
                      Skill Gaps
                    </h3>
                    <ul className="space-y-2">
                      {currentAnalysis.skillGaps.map((gap, idx) => (
                        <li 
                          key={idx}
                          className={cn(
                            "flex items-center gap-2 text-sm",
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          )}
                        >
                          <span className="text-violet-500">→</span>
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className={cn(
                    "p-6 rounded-2xl border",
                    isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
                  )}>
                    <h3 className={cn(
                      "font-bold mb-3 flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>
                      <Award className="w-5 h-5 text-cyan-500" />
                      Improvements
                    </h3>
                    <ul className="space-y-2">
                      {currentAnalysis.improvements.slice(0, 4).map((improvement, idx) => (
                        <li 
                          key={idx}
                          className={cn(
                            "flex items-start gap-2 text-sm",
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          )}
                        >
                          <span className="text-cyan-500 mt-0.5">•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Career Path */}
                <div className={cn(
                  "p-6 rounded-2xl border",
                  isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
                )}>
                  <h3 className={cn(
                    "text-xl font-bold mb-4 flex items-center gap-2",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>
                    <Target className="w-6 h-6 text-emerald-500" />
                    Recommended Career Path: {currentAnalysis.careerPath.recommended}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {currentAnalysis.careerPath.roadmap.map((step) => (
                      <div 
                        key={step.step}
                        className={cn(
                          "p-4 rounded-xl border relative",
                          isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
                        )}
                      >
                        <div className={cn(
                          "absolute -top-3 left-4 px-2 py-0.5 rounded-full text-xs font-bold",
                          "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                        )}>
                          Step {step.step}
                        </div>
                        <h4 className={cn(
                          "font-bold mt-2",
                          isDarkMode ? "text-white" : "text-gray-900"
                        )}>{step.title}</h4>
                        <p className={cn(
                          "text-xs mt-1",
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        )}>{step.duration}</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {step.skills.map((skill, idx) => (
                            <span 
                              key={idx}
                              className={cn(
                                "px-2 py-0.5 rounded text-xs",
                                isDarkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"
                              )}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className={cn(
                "p-12 rounded-2xl border text-center",
                isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
              )}>
                <FileText className={cn(
                  "w-16 h-16 mx-auto mb-4",
                  isDarkMode ? "text-gray-600" : "text-gray-300"
                )} />
                <h3 className={cn(
                  "text-xl font-bold mb-2",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>No Resume Analyzed</h3>
                <p className={cn(
                  "text-sm max-w-md mx-auto",
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                )}>
                  Upload your resume or paste your resume text to receive a comprehensive AI-powered analysis with ATS score, skill gaps, and career recommendations.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
