import React, { useState, useEffect } from 'react';
import { loadDomains, type DomainOption } from '../../data/domains';
import { generateQuestions, type QuizQuestion } from '../../utils/gemini';

const Assessments: React.FC = () => {
    const [domains, setDomains] = useState<DomainOption[]>([]);

    // Selection state
    const [selectedDomain, setSelectedDomain] = useState<string>('');
    const [selectedSkill, setSelectedSkill] = useState<string>('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

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
            const results = await generateQuestions(domainObj.name, selectedSkill, selectedDifficulty);
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
    };

    const getScore = () => {
        let correct = 0;
        questions.forEach((q, i) => {
            if (userAnswers[i] === q.answer) correct++;
        });
        return correct;
    };

    return (
        <div className="w-full max-w-5xl mx-auto text-[#f5f5f5] bg-transparent">
            {/* Page Title */}
            <h1 className="text-2xl font-bold mb-6 tracking-tight">Assessments</h1>

            {/* Configuration Card */}
            <div className="bg-[#111111] border border-[#2a2a2a] p-6 rounded-2xl mb-6 flex flex-col md:flex-row gap-6 md:items-end shadow-sm transiton-colors hover:border-[#3a3a3a]">
                {/* Domain Dropdown */}
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#6b6b6b]">Domain</label>
                    <select
                        className="bg-[#1a1a1a] border border-[#3a3a3a] text-[#f5f5f5] placeholder-[#6b6b6b] rounded-lg px-4 py-2.5 w-full focus:outline-none focus:border-[#f5f5f5] hover:border-[#6b6b6b] transition-colors appearance-none cursor-pointer"
                        value={selectedDomain}
                        onChange={e => setSelectedDomain(e.target.value)}
                    >
                        {domains.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>

                {/* Skill Dropdown */}
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#6b6b6b]">Topics</label>
                    <select
                        className="bg-[#1a1a1a] border border-[#3a3a3a] text-[#f5f5f5] placeholder-[#6b6b6b] rounded-lg px-4 py-2.5 w-full focus:outline-none focus:border-[#f5f5f5] hover:border-[#6b6b6b] transition-colors appearance-none cursor-pointer"
                        value={selectedSkill}
                        onChange={e => setSelectedSkill(e.target.value)}
                    >
                        {domains.find(d => d.id === selectedDomain)?.skills.map(skill => (
                            <option key={skill} value={skill}>{skill}</option>
                        ))}
                    </select>
                </div>

                {/* Difficulty Toggle Buttons */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#6b6b6b]">Difficulty</label>
                    <div className="flex gap-2">
                        {['Easy', 'Medium', 'Hard'].map(level => (
                            <button
                                key={level}
                                onClick={() => setSelectedDifficulty(level as any)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all ${selectedDifficulty === level
                                    ? 'bg-[#f5f5f5] border-[#f5f5f5] text-[#0a0a0a]'
                                    : 'bg-[#1a1a1a] border-[#3a3a3a] text-[#b0b0b0] hover:text-[#f5f5f5] hover:border-[#6b6b6b]'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Generate Button */}
                <div className="mt-4 md:mt-0 md:ml-auto w-full md:w-auto flex">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-[#f5f5f5] hover:bg-[#e0e0e0] text-[#0a0a0a] px-5 py-2.5 rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 flex items-center justify-center gap-2 w-full shadow-sm hover:-translate-y-0.5"
                    >
                        {loading && (
                            <svg className="animate-spin h-4 w-4 text-[#0a0a0a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Generating...' : 'Generate Questions'}
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
                    {hasSubmitted && (getScore() < questions.length) && (
                        <div className="bg-[#111111] border border-yellow-900/50 text-yellow-500 p-5 rounded-2xl mt-8 text-center font-medium">
                            You should revise the prerequisites required for this skill.
                        </div>
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
