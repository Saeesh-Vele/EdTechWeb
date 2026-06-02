import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadDomains, type DomainOption } from '../../data/domains';
import { generateQuestions, type QuizQuestion } from '../../utils/gemini';
import { db, auth } from '../../firebase/config';
import { addDoc, collection, serverTimestamp, setDoc, doc, increment } from 'firebase/firestore';
import useStudyTracker from '../../hooks/useStudyTracker';
import { logActivity } from '../../utils/activityLogger';

const Assessments: React.FC = () => {
    const navigate = useNavigate();
    const [domains, setDomains] = useState<DomainOption[]>([]);

    // Selection state
    const [selectedDomain, setSelectedDomain] = useState<string>('');
    const [selectedSkill, setSelectedSkill] = useState<string>('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [numQuestions, setNumQuestions] = useState<number>(5);

    // Study time tracking
    const domainObj = domains.find(d => d.id === selectedDomain);
    useStudyTracker({
        type: 'assessment',
        skill: selectedSkill,
        domain: domainObj?.name || selectedDomain
    });

    // Quiz State
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Interactive state
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

    useEffect(() => {
        const loaded = loadDomains();
        setDomains(loaded);
        if (loaded.length > 0) {
            setSelectedDomain(loaded[0].id);
        }
    }, []);

    // Reset skill selection when domain changes
    useEffect(() => {
        const domain = domains.find(d => d.id === selectedDomain);
        if (domain && domain.skills.length > 0) {
            setSelectedSkill(domain.skills[0]);
        } else {
            setSelectedSkill('');
        }
    }, [selectedDomain, domains]);

    const handleGenerate = async () => {
        if (!selectedDomain || !selectedSkill) return;

        const domainObj = domains.find(d => d.id === selectedDomain);
        if (!domainObj) return;

        setLoading(true);
        setError(null);
        setQuestions([]);
        setUserAnswers({});
        setHasSubmitted(false);

        try {
            const results = await generateQuestions(domainObj.name, selectedSkill, selectedDifficulty, numQuestions);
            setQuestions(results);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred while talking to Gemini API.');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (qIndex: number, option: string) => {
        if (hasSubmitted) return;
        setUserAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const submitQuiz = () => {
        setHasSubmitted(true);

        // Save assessment result to Firestore in the background
        const currentUser = auth.currentUser;
        if (currentUser && questions.length > 0) {
            const score = getScore();
            const totalQuestions = questions.length;
            const percentage = Math.round((score / totalQuestions) * 100);

            const domainObj = domains.find(d => d.id === selectedDomain);

            addDoc(collection(db, 'users', currentUser.uid, 'assessments'), {
                score,
                totalQuestions,
                percentage,
                domain: domainObj?.name || selectedDomain,
                skill: selectedSkill,
                difficulty: selectedDifficulty,
                createdAt: serverTimestamp()
            }).then(() => {
                // Log to Recent Activity feed
                const label = selectedSkill
                    ? `${selectedSkill} (${domainObj?.name || selectedDomain})`
                    : domainObj?.name || selectedDomain;
                logActivity(
                    'quiz_completed',
                    `Completed quiz: ${label} — ${score}/${totalQuestions}`,
                    `quiz::${selectedSkill}::${Date.now()}`
                );

                // ── Update per-topic performance for Hindsight ──
                const topicResults: Record<string, { correct: number; wrong: number }> = {};
                questions.forEach((q, i) => {
                    const topic = q.topic || selectedSkill || 'General';
                    if (!topicResults[topic]) {
                        topicResults[topic] = { correct: 0, wrong: 0 };
                    }
                    if (userAnswers[i] === q.answer) {
                        topicResults[topic].correct++;
                    } else {
                        topicResults[topic].wrong++;
                    }
                });

                Object.entries(topicResults).forEach(([topic, result]) => {
                    const topicId = topic.replace(/\s+/g, '-').toLowerCase();
                    const topicRef = doc(db, 'users', currentUser.uid, 'topicPerformance', topicId);
                    const totalForTopic = result.correct + result.wrong;

                    setDoc(topicRef, {
                        topicName: topic,
                        correct: increment(result.correct),
                        wrong: increment(result.wrong),
                        total: increment(totalForTopic),
                        domain: domainObj?.name || selectedDomain,
                        lastAttemptAt: serverTimestamp(),
                    }, { merge: true }).catch(err =>
                        console.error('Failed to update topic performance:', err)
                    );
                });
            }).catch(err => console.error('Failed to save assessment:', err));
        }
    };

    const getScore = () => {
        let correct = 0;
        questions.forEach((q, i) => {
            if (userAnswers[i] === q.answer) correct++;
        });
        return correct;
    };

    const getIncorrectTopics = () => {
        const topics = new Set<string>();
        questions.forEach((q, i) => {
            if (userAnswers[i] !== q.answer) {
                if (q.topic) topics.add(q.topic);
            }
        });
        return Array.from(topics);
    };

    return (
        <div className="w-full max-w-5xl mx-auto text-white pb-16">
            {/* Page Title */}
            <div className="mb-10 relative mt-6">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl opacity-30 rounded-full"></div>
                <h1 className="relative text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                    Assessments
                </h1>
                <p className="relative mt-3 text-gray-400 text-sm md:text-base max-w-2xl">
                    Test your knowledge with AI-generated questions tailored to your learning path.
                </p>
            </div>

            {/* Configuration Card */}
            <div className="relative group mb-12">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-white/5 rounded-3xl blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-3xl">
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        </div>
                        <div>
                            <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">Configure Assessment</h2>
                            <p className="text-gray-400 text-sm mt-1">Fine-tune your quiz parameters below.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {/* Domain Dropdown */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center h-full transition-all duration-300 hover:border-white/20 hover:bg-white/[0.02]">
                            <label className="text-[11px] uppercase text-gray-400 mb-2.5 font-bold tracking-widest flex items-center gap-2">
                                Domain
                            </label>
                            <div className="relative flex items-center">
                                <select
                                    className="bg-transparent text-white w-full outline-none border-none focus:ring-0 appearance-none cursor-pointer p-0 font-medium text-base z-10"
                                    value={selectedDomain}
                                    onChange={e => setSelectedDomain(e.target.value)}
                                >
                                    {domains.map(d => (
                                        <option key={d.id} value={d.id} className="bg-[#111111] text-white">{d.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-0 text-gray-500 pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                            </div>
                        </div>

                        {/* Skill Dropdown */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center h-full transition-all duration-300 hover:border-white/20 hover:bg-white/[0.02]">
                            <label className="text-[11px] uppercase text-gray-400 mb-2.5 font-bold tracking-widest flex items-center gap-2">
                                Topic
                            </label>
                            <div className="relative flex items-center">
                                <select
                                    className="bg-transparent text-white w-full outline-none border-none focus:ring-0 appearance-none cursor-pointer p-0 font-medium text-base z-10"
                                    value={selectedSkill}
                                    onChange={e => setSelectedSkill(e.target.value)}
                                >
                                    {domains.find(d => d.id === selectedDomain)?.skills.map(skill => (
                                        <option key={skill} value={skill} className="bg-[#111111] text-white">{skill}</option>
                                    ))}
                                </select>
                                <div className="absolute right-0 text-gray-500 pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                            </div>
                        </div>

                        {/* Number of Questions Stepper */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between h-full transition-all duration-300 hover:border-white/20 hover:bg-white/[0.02]">
                            <label className="text-[11px] uppercase text-gray-400 font-bold tracking-widest flex-1">Questions</label>
                            <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl p-1 border border-white/5">
                                <button 
                                    onClick={() => setNumQuestions(prev => Math.max(3, prev - 1))}
                                    className="text-gray-400 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg p-1.5 active:scale-95 focus:outline-none"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                </button>
                                <span className="text-white font-bold text-sm w-6 text-center select-none">{numQuestions}</span>
                                <button 
                                    onClick={() => setNumQuestions(prev => Math.min(10, prev + 1))}
                                    className="text-gray-400 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg p-1.5 active:scale-95 focus:outline-none"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                </button>
                            </div>
                        </div>

                        {/* Difficulty Segmented Control */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center h-full transition-all duration-300 hover:border-white/20 hover:bg-white/[0.02]">
                            <label className="text-[11px] uppercase text-gray-400 mb-2.5 font-bold tracking-widest">Difficulty</label>
                            <div className="bg-[#1a1a1a] border border-white/5 p-1 flex gap-1 rounded-xl">
                                {['Easy', 'Medium', 'Hard'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setSelectedDifficulty(level as any)}
                                        className={`flex-1 rounded-lg text-xs py-2 transition-all duration-300 font-semibold focus:outline-none ${
                                            selectedDifficulty === level
                                                ? 'bg-white text-black shadow-sm'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="group relative inline-flex items-center justify-center gap-3 bg-white text-black font-semibold text-sm px-8 py-3.5 rounded-2xl hover:bg-gray-100 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                        >
                            {!loading && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform ease-in-out"></div>
                            )}
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            )}
                            <span className="relative z-10">{loading ? 'Generating...' : 'Generate Questions'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-2xl mb-8 text-sm flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Questions List */}
            {questions.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {questions.map((q, i) => (
                        <div key={i} className="group bg-[#0a0a0a] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6 transition-all duration-300 hover:border-white/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-semibold text-gray-400">
                                    {i + 1}
                                </div>
                                <h3 className="text-white font-medium text-lg md:text-xl leading-relaxed mt-0.5">{q.question}</h3>
                            </div>
                            
                            <div className="grid gap-3 pl-0 md:pl-12">
                                {q.options.map((opt, optIdx) => {
                                    const isSelected = userAnswers[i] === opt;
                                    let optionStyle = 'bg-black border-white/5 hover:border-white/20 hover:bg-white/[0.02] text-gray-300';
                                    let iconContent = <div className="w-5 h-5 rounded-full border border-white/20 mr-3 shrink-0"></div>;

                                    if (isSelected && !hasSubmitted) {
                                        optionStyle = 'bg-white/5 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]';
                                        iconContent = (
                                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center mr-3 shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-black"></div>
                                            </div>
                                        );
                                    } else if (hasSubmitted) {
                                        if (opt === q.answer) {
                                            optionStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
                                            iconContent = (
                                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-3 border border-emerald-500/30 shrink-0">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </div>
                                            );
                                        } else if (isSelected) {
                                            optionStyle = 'bg-red-500/10 border-red-500/30 text-red-300';
                                            iconContent = (
                                                <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mr-3 border border-red-500/30 shrink-0">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </div>
                                            );
                                        }
                                    }

                                    return (
                                        <div
                                            key={optIdx}
                                            onClick={() => !hasSubmitted && handleOptionSelect(i, opt)}
                                            className={`flex items-center px-5 py-4 rounded-2xl border transition-all duration-300 ${!hasSubmitted ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'} ${optionStyle}`}
                                        >
                                            {iconContent}
                                            <span className="text-[15px] leading-snug">{opt}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation / Result */}
                            {hasSubmitted && (
                                <div className="mt-4 pl-0 md:pl-12">
                                    <div className="p-5 rounded-2xl bg-[#111] border border-white/5 text-[14px] text-gray-300 leading-relaxed flex items-start gap-3">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                        <div>
                                            <span className="font-semibold text-white block mb-1">Explanation</span>
                                            <span className="text-gray-400">{q.explanation}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Footer Actions / Results */}
                    {hasSubmitted && (
                        getScore() === questions.length ? (
                            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-emerald-950/40 border border-emerald-500/20 p-10 rounded-3xl mt-8 flex flex-col items-center gap-4 text-center animate-in zoom-in duration-500">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="relative z-10 w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-3xl mb-2 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    🏆
                                </div>
                                <h3 className="relative z-10 font-bold text-2xl text-white">Perfect Score!</h3>
                                <p className="relative z-10 text-emerald-200/80 max-w-md">You answered all questions correctly. You have an excellent grasp of {selectedSkill}.</p>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-red-950/30 to-black border border-red-900/30 p-8 rounded-3xl mt-8 animate-in zoom-in duration-500">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                    </div>
                                    <h3 className="text-white font-semibold text-lg">Topics to Review</h3>
                                </div>
                                <div className="flex flex-wrap gap-2.5 mb-8">
                                    {getIncorrectTopics().map((topic, idx) => (
                                        <div key={idx} className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-2 rounded-xl text-sm font-medium">
                                            {topic}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/revision', { state: { topics: getIncorrectTopics() } })}
                                    className="bg-white text-black font-semibold px-6 py-3.5 rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-200 w-full md:w-auto shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    Start Revision Session
                                </button>
                            </div>
                        )
                    )}

                    <div className="sticky bottom-6 z-10 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between mt-8 shadow-[0_20px_40px_rgb(0,0,0,0.8)]">
                        {!hasSubmitted ? (
                            <>
                                <span className="text-gray-400 text-sm font-medium mb-4 md:mb-0">
                                    {Object.keys(userAnswers).length} of {questions.length} answered
                                </span>
                                <button
                                    onClick={submitQuiz}
                                    disabled={Object.keys(userAnswers).length !== questions.length}
                                    className="w-full md:w-auto bg-white hover:bg-gray-200 text-black font-semibold px-8 py-3.5 rounded-2xl active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    Submit Answers
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-4 mb-4 md:mb-0">
                                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                        <span className="font-bold text-white text-lg">{getScore()}</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-white text-lg block">Final Score</span>
                                        <span className="text-gray-400 text-sm">{Math.round((getScore() / questions.length) * 100)}% Accuracy</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    className="w-full md:w-auto bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98]"
                                >
                                    Take Another Test
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assessments;
