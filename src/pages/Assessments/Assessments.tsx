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
        <div className="w-full max-w-5xl mx-auto text-white">
            {/* Page Title */}
            <h1 className="text-3xl font-semibold mb-8 tracking-tight text-white">Assessments</h1>

            {/* Configuration Card */}
            <div className="bg-[#111111] border border-white/5 p-6 md:p-8 rounded-2xl mb-10 transition-colors duration-200 hover:border-white/10">

                <div className="mb-8">
                    <h2 className="text-white text-xl font-semibold tracking-tight mb-1">Configure Assessment</h2>
                    <p className="text-gray-400 text-sm">Choose your topic, adjust the difficulty, and set the number of questions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Domain Dropdown */}
                    <div className="bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 flex flex-col justify-center h-full transition-all duration-200 hover:border-white/20 group cursor-pointer relative focus-within:border-white/30 focus-within:bg-[#121212]">
                        <label className="text-[10px] uppercase text-gray-500 mb-2 font-semibold tracking-widest flex items-center gap-2">
                            <span>Domain</span>
                        </label>
                        <div className="relative flex items-center">
                            <select
                                className="bg-transparent text-white w-full outline-none border-none focus:ring-0 appearance-none cursor-pointer p-0 font-medium text-sm z-10"
                                value={selectedDomain}
                                onChange={e => setSelectedDomain(e.target.value)}
                            >
                                {domains.map(d => (
                                    <option key={d.id} value={d.id} className="bg-[#111111] text-white">{d.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-0 text-gray-500 group-hover:text-gray-300 transition-colors duration-200">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>
                    </div>

                    {/* Skill Dropdown */}
                    <div className="bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 flex flex-col justify-center h-full transition-all duration-200 hover:border-white/20 group cursor-pointer relative focus-within:border-white/30 focus-within:bg-[#121212]">
                        <label className="text-[10px] uppercase text-gray-500 mb-2 font-semibold tracking-widest flex items-center gap-2">
                            <span>Topic</span>
                        </label>
                        <div className="relative flex items-center">
                            <select
                                className="bg-transparent text-white w-full outline-none border-none focus:ring-0 appearance-none cursor-pointer p-0 font-medium text-sm z-10"
                                value={selectedSkill}
                                onChange={e => setSelectedSkill(e.target.value)}
                            >
                                {domains.find(d => d.id === selectedDomain)?.skills.map(skill => (
                                    <option key={skill} value={skill} className="bg-[#111111] text-white">{skill}</option>
                                ))}
                            </select>
                            <div className="absolute right-0 text-gray-500 group-hover:text-gray-300 transition-colors duration-200">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>
                    </div>

                    {/* Number of Questions Stepper */}
                    <div className="bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between h-full transition-all duration-200 hover:border-white/20">
                        <label className="text-[10px] uppercase text-gray-500 font-semibold tracking-widest flex-1">Questions</label>
                        <div className="flex items-center gap-1.5 bg-[#0a0a0a] rounded-lg px-1 py-1 border border-white/5">
                            <button 
                                onClick={() => setNumQuestions(prev => Math.max(3, prev - 1))}
                                className="text-gray-500 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-md p-1.5 focus:outline-none"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                            <span className="text-white font-semibold text-sm w-7 text-center select-none">{numQuestions}</span>
                            <button 
                                onClick={() => setNumQuestions(prev => Math.min(10, prev + 1))}
                                className="text-gray-500 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-md p-1.5 focus:outline-none"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                        </div>
                    </div>

                    {/* Difficulty Segmented Control */}
                    <div className="bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 flex flex-col justify-center h-full transition-all duration-200 hover:border-white/20">
                        <label className="text-[10px] uppercase text-gray-500 mb-2 font-semibold tracking-widest">Difficulty</label>
                        <div className="bg-[#0a0a0a] border border-white/5 p-1 flex gap-0.5 rounded-lg">
                            {['Easy', 'Medium', 'Hard'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedDifficulty(level as any)}
                                    className={`flex-1 rounded-lg text-[13px] py-1.5 transition-all duration-200 font-medium focus:outline-none ${
                                        selectedDifficulty === level
                                            ? 'bg-white text-black'
                                            : 'text-gray-400 hover:text-gray-200 bg-transparent'
                                    }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-white text-black font-medium text-sm px-6 py-3 rounded-xl hover:bg-gray-200 active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        )}
                        {loading ? 'Generating...' : 'Generate Questions'}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-950/20 border border-red-900/30 text-red-400 p-4 rounded-xl mb-8 text-sm">
                    🚨 {error}
                </div>
            )}

            {/* Questions List */}
            {questions.length > 0 && (
                <div className="space-y-4">
                    {questions.map((q, i) => (
                        <div key={i} className="bg-[#111111] border border-white/5 p-6 rounded-2xl space-y-4 transition-colors duration-200 hover:border-white/10">
                            <h3 className="text-white font-medium text-[15px] leading-relaxed">{i + 1}. {q.question}</h3>
                            <div className="space-y-2">
                                {q.options.map((opt, optIdx) => {
                                    const isSelected = userAnswers[i] === opt;
                                    let optionStyle = 'bg-[#0d0d0d] border-white/10 hover:border-white/20 hover:bg-[#121212] text-gray-400';

                                    if (isSelected && !hasSubmitted) {
                                        optionStyle = 'bg-white border-white text-black font-medium';
                                    } else if (hasSubmitted) {
                                        if (opt === q.answer) {
                                            optionStyle = 'bg-emerald-950/30 border-emerald-800/30 text-emerald-400 font-medium';
                                        } else if (isSelected) {
                                            optionStyle = 'bg-red-950/30 border-red-800/30 text-red-400 font-medium';
                                        }
                                    }

                                    return (
                                        <div
                                            key={optIdx}
                                            onClick={() => !hasSubmitted && handleOptionSelect(i, opt)}
                                            className={`px-4 py-3 rounded-xl border transition-all duration-200 text-sm ${!hasSubmitted ? 'cursor-pointer' : 'cursor-default'
                                                } ${optionStyle}`}
                                        >
                                            {opt}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation / Result */}
                            {hasSubmitted && (
                                <div className="mt-3 p-4 rounded-xl bg-[#0d0d0d] border border-white/5 text-[13px] text-gray-400 leading-relaxed">
                                    <span className="font-medium text-gray-300 mr-1.5">Explanation:</span>
                                    {q.explanation}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Footer Actions / Results */}
                    {hasSubmitted && (
                        getScore() === questions.length ? (
                            <div className="bg-emerald-950/20 border border-emerald-800/20 text-emerald-400 p-6 rounded-2xl mt-6 flex flex-col items-center gap-2">
                                <span className="text-2xl">🎉</span>
                                <span className="font-semibold text-lg">Great job!</span>
                                <span className="text-sm text-emerald-400/70">You answered all questions correctly.</span>
                            </div>
                        ) : (
                            <div className="bg-[#111111] border border-red-900/20 p-6 rounded-2xl mt-6">
                                <h3 className="text-red-400 font-semibold mb-4 text-base">You should revise the following topics:</h3>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {getIncorrectTopics().map((topic, idx) => (
                                        <div key={idx} className="bg-red-950/20 border border-red-900/20 text-red-300 px-3 py-1.5 rounded-lg text-sm font-medium">
                                            {topic}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/revision', { state: { topics: getIncorrectTopics() } })}
                                    className="bg-white text-black font-medium px-5 py-2.5 rounded-xl hover:bg-gray-200 active:scale-[0.97] transition-all duration-150 w-full md:w-auto"
                                >
                                    Start Revision
                                </button>
                            </div>
                        )
                    )}

                    <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl flex items-center justify-between mt-4">
                        {!hasSubmitted ? (
                            <>
                                <span className="text-gray-500 text-sm hidden md:inline">Select your answers above.</span>
                                <button
                                    onClick={submitQuiz}
                                    disabled={Object.keys(userAnswers).length !== questions.length}
                                    className="bg-white hover:bg-gray-200 text-black font-medium px-6 py-2.5 rounded-xl active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
                                >
                                    Submit Answers
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="font-semibold text-white text-lg tracking-tight">Score: {getScore()} / {questions.length}</span>
                                <button
                                    onClick={handleGenerate}
                                    className="border border-white/10 hover:border-white text-gray-300 hover:text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-200 ml-auto"
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
