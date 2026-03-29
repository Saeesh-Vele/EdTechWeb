import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadDomains, type DomainOption } from '../../data/domains';
import { generateQuestions, type QuizQuestion } from '../../utils/gemini';
import { db, auth } from '../../firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
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
        <div className="w-full max-w-5xl mx-auto text-[#f5f5f5] bg-transparent">
            {/* Page Title */}
            <h1 className="text-2xl font-bold mb-6 tracking-tight">Assessments</h1>

            {/* Configuration Card */}
            <div className="bg-[#0a0a0a] border border-[#222222] p-8 rounded-3xl mb-8 shadow-2xl relative overflow-hidden">
                {/* Subtle top glare/gradient for premium feel */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-500/20 to-transparent"></div>

                <div className="mb-8">
                    <h2 className="text-white text-2xl font-bold tracking-tight mb-1">Configure Assessment</h2>
                    <p className="text-[#888888] text-sm font-medium">Choose your topic, adjust the difficulty, and set the number of questions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* Domain Dropdown */}
                    <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-4 flex flex-col justify-center h-full transition-all duration-300 hover:border-[#444444] group cursor-pointer relative focus-within:ring-2 focus-within:ring-[#555] focus-within:border-[#555]">
                        <label className="text-[10px] uppercase text-[#777777] mb-2 font-bold tracking-widest flex items-center gap-2">
                            <span>Domain</span>
                        </label>
                        <div className="relative flex items-center">
                            <select
                                className="bg-transparent text-white w-full outline-none border-none focus:ring-0 appearance-none cursor-pointer p-0 font-medium text-[15px] z-10"
                                value={selectedDomain}
                                onChange={e => setSelectedDomain(e.target.value)}
                            >
                                {domains.map(d => (
                                    <option key={d.id} value={d.id} className="bg-[#141414] text-white">{d.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-0 text-[#666] group-hover:text-white transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>
                    </div>

                    {/* Skill Dropdown */}
                    <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-4 flex flex-col justify-center h-full transition-all duration-300 hover:border-[#444444] group cursor-pointer relative focus-within:ring-2 focus-within:ring-[#555] focus-within:border-[#555]">
                        <label className="text-[10px] uppercase text-[#777777] mb-2 font-bold tracking-widest flex items-center gap-2">
                            <span>Topic</span>
                        </label>
                        <div className="relative flex items-center">
                            <select
                                className="bg-transparent text-white w-full outline-none border-none focus:ring-0 appearance-none cursor-pointer p-0 font-medium text-[15px] z-10"
                                value={selectedSkill}
                                onChange={e => setSelectedSkill(e.target.value)}
                            >
                                {domains.find(d => d.id === selectedDomain)?.skills.map(skill => (
                                    <option key={skill} value={skill} className="bg-[#141414] text-white">{skill}</option>
                                ))}
                            </select>
                            <div className="absolute right-0 text-[#666] group-hover:text-white transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>
                    </div>

                    {/* Number of Questions Stepper */}
                    <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-4 flex items-center justify-between h-full transition-all duration-300 hover:border-[#444444]">
                        <label className="text-[10px] uppercase text-[#777777] font-bold tracking-widest flex-1">Questions</label>
                        <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-xl px-1.5 py-1.5 border border-[#222]">
                            <button 
                                onClick={() => setNumQuestions(prev => Math.max(3, prev - 1))}
                                className="text-[#666] hover:text-white transition-colors bg-[#1a1a1a] hover:bg-[#333] rounded-lg p-1.5 focus:outline-none"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                            <span className="text-white font-bold text-sm w-7 text-center select-none">{numQuestions}</span>
                            <button 
                                onClick={() => setNumQuestions(prev => Math.min(10, prev + 1))}
                                className="text-[#666] hover:text-white transition-colors bg-[#1a1a1a] hover:bg-[#333] rounded-lg p-1.5 focus:outline-none"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                        </div>
                    </div>

                    {/* Difficulty Segmented Control */}
                    <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-4 flex flex-col justify-center h-full transition-all duration-300 hover:border-[#444444]">
                        <label className="text-[10px] uppercase text-[#777777] mb-2 font-bold tracking-widest">Difficulty</label>
                        <div className="bg-[#0a0a0a] border border-[#222] p-1.5 flex gap-1 rounded-xl">
                            {['Easy', 'Medium', 'Hard'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedDifficulty(level as any)}
                                    className={`flex-1 rounded-lg text-[13px] py-1 transition-all duration-300 font-semibold focus:outline-none ${
                                        selectedDifficulty === level
                                            ? 'bg-[#ffffff] text-black shadow-sm scale-[1.02]'
                                            : 'text-[#666] hover:text-[#ddd] bg-transparent hover:bg-[#222]'
                                    }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom line separator */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent mb-6"></div>

                <div className="flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-white text-black font-semibold text-[15px] px-8 py-3.5 rounded-xl hover:bg-[#e0e0e0] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-0.5"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        )}
                        {loading ? 'Generating Assessment...' : 'Generate Questions'}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-950/30 border border-red-900 text-red-400 p-4 rounded-xl mb-6 text-sm">
                    🚨 {error}
                </div>
            )}

            {/* Questions List */}
            {questions.length > 0 && (
                <div className="space-y-6">
                    {questions.map((q, i) => (
                        <div key={i} className="bg-[#111111] border border-[#2a2a2a] p-6 rounded-2xl space-y-5 transition-colors hover:border-[#3a3a3a]">
                            <h3 className="text-[#f5f5f5] font-semibold text-lg leading-snug">{i + 1}. {q.question}</h3>
                            <div className="space-y-3">
                                {q.options.map((opt, optIdx) => {
                                    const isSelected = userAnswers[i] === opt;
                                    let optionStyle = 'bg-[#1a1a1a] border-[#3a3a3a] hover:bg-[#222222] hover:border-[#6b6b6b] text-[#b0b0b0]';

                                    if (isSelected && !hasSubmitted) {
                                        optionStyle = 'bg-[#f5f5f5] border-[#f5f5f5] text-[#0a0a0a] font-medium shadow-sm';
                                    } else if (hasSubmitted) {
                                        if (opt === q.answer) {
                                            optionStyle = 'bg-green-950/40 border-green-800 text-green-400 font-medium';
                                        } else if (isSelected) {
                                            optionStyle = 'bg-red-950/40 border-red-800 text-red-400 font-medium';
                                        }
                                    }

                                    return (
                                        <div
                                            key={optIdx}
                                            onClick={() => !hasSubmitted && handleOptionSelect(i, opt)}
                                            className={`px-4 py-3.5 rounded-xl border transition-all duration-200 ${!hasSubmitted ? 'cursor-pointer' : 'cursor-default'
                                                } ${optionStyle}`}
                                        >
                                            {opt}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation / Result */}
                            {hasSubmitted && (
                                <div className="mt-5 p-5 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-[#b0b0b0] leading-relaxed">
                                    <span className="font-bold text-[#f5f5f5] mr-2">Explanation:</span>
                                    {q.explanation}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Footer Actions / Results */}
                    {hasSubmitted && (
                        getScore() === questions.length ? (
                            <div className="bg-green-950/30 border border-green-900/50 text-green-400 p-6 rounded-2xl mt-8 flex flex-col items-center gap-2">
                                <span className="text-2xl">🎉</span>
                                <span className="font-bold text-lg">Great job!</span>
                                <span className="text-sm">You answered all questions correctly.</span>
                            </div>
                        ) : (
                            <div className="bg-[#111111] border border-red-900/50 p-6 rounded-2xl mt-8">
                                <h3 className="text-red-400 font-bold mb-4 text-lg">You should revise the following topics:</h3>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {getIncorrectTopics().map((topic, idx) => (
                                        <div key={idx} className="bg-red-950/40 border border-red-900/50 text-red-200 px-3 py-1.5 rounded-lg text-sm font-medium">
                                            {topic}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/revision', { state: { topics: getIncorrectTopics() } })}
                                    className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-lg transition-all shadow-sm hover:-translate-y-0.5 w-full md:w-auto"
                                >
                                    Start Revision
                                </button>
                            </div>
                        )
                    )}

                    <div className="bg-[#111111] border border-[#2a2a2a] p-6 rounded-2xl flex items-center justify-between mt-6 shadow-sm">
                        {!hasSubmitted ? (
                            <>
                                <span className="text-[#6b6b6b] text-sm hidden md:inline font-medium">Select your answers above.</span>
                                <button
                                    onClick={submitQuiz}
                                    disabled={Object.keys(userAnswers).length !== questions.length}
                                    className="bg-[#f5f5f5] hover:bg-[#e0e0e0] text-[#0a0a0a] font-bold px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto shadow-sm hover:-translate-y-0.5"
                                >
                                    Submit Answers
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="font-bold text-[#f5f5f5] text-xl tracking-tight">Score: {getScore()} / {questions.length}</span>
                                <button
                                    onClick={handleGenerate}
                                    className="bg-[#1a1a1a] border border-[#3a3a3a] hover:border-[#f5f5f5] hover:text-[#f5f5f5] text-[#e0e0e0] font-bold px-6 py-2.5 rounded-lg transition-all ml-auto"
                                >
                                    Retry Assessment
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
