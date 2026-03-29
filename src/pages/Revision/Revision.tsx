import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateRevisionNotes, type RevisionTopic } from '../../utils/gemini';
import useStudyTracker from '../../hooks/useStudyTracker';

const Revision: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const topics: string[] = location.state?.topics || [];

    // Track study time on revision pages
    useStudyTracker({
        type: 'notes',
        skill: topics.join(', '),
        domain: 'Revision'
    });

    const [revisionData, setRevisionData] = useState<RevisionTopic[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Disable React Hooks exhaustive depth requirement because we only want to fetch once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!topics || topics.length === 0) {
            setLoading(false);
            return;
        }

        const fetchNotes = async () => {
            try {
                setLoading(true);
                const data = await generateRevisionNotes(topics);
                setRevisionData(data);
            } catch (err: any) {
                setError(err.message || "Failed to generate revision notes.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, []); // Only fetch when component mounts

    if (!topics || topics.length === 0) {
        return (
            <div className="w-full max-w-5xl mx-auto text-[#f5f5f5] bg-transparent mt-10">
                <div className="bg-[#111111] border border-[#2a2a2a] p-8 rounded-2xl text-center shadow-sm">
                    <h2 className="text-xl font-bold mb-4">No topics found for revision.</h2>
                    <p className="text-[#b0b0b0] mb-6">Please complete an assessment first to identify areas for improvement.</p>
                    <button
                        onClick={() => navigate('/dashboard/assessments')}
                        className="bg-[#f5f5f5] hover:bg-[#e0e0e0] text-[#0a0a0a] px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm hover:-translate-y-0.5"
                    >
                        Go to Assessments
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto text-[#f5f5f5] bg-transparent">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">Revision Plan</h1>
                    <p className="text-[#b0b0b0] text-sm">Targeted notes and resources based on your recent assessment.</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/assessments')}
                    className="bg-[#1a1a1a] border border-[#3a3a3a] hover:border-[#f5f5f5] hover:text-[#f5f5f5] text-[#b0b0b0] px-4 py-2 rounded-lg font-medium transition-all text-sm"
                >
                    Back to Assessments
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-[#111111] border border-[#3a3a3a] text-[#f5f5f5] p-4 rounded-xl mb-6 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-[#111111] border border-[#2a2a2a] p-12 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                    <svg className="animate-spin h-8 w-8 text-[#f5f5f5] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-[#b0b0b0] font-medium animate-pulse">Analyzing topics and gathering revision materials...</p>
                </div>
            )}

            {/* Content Array */}
            {!loading && revisionData.length > 0 && (
                <div className="space-y-6">
                    {revisionData.map((item, idx) => (
                        <div key={idx} className="bg-[#111111] border border-[#2a2a2a] p-6 rounded-xl space-y-4 shadow-sm hover:border-[#3a3a3a] transition-colors">
                            <h3 className="text-[#f5f5f5] font-bold text-xl">{item.topic}</h3>

                            <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a]">
                                <h4 className="text-[#6b6b6b] text-xs font-bold uppercase tracking-widest mb-2">Key Notes</h4>
                                <div className="text-[#b0b0b0] text-sm leading-relaxed whitespace-pre-wrap">
                                    {item.notes}
                                </div>
                            </div>

                            {item.videos && item.videos.length > 0 && (
                                <div className="pt-2">
                                    <h4 className="text-[#6b6b6b] text-xs font-bold uppercase tracking-widest mb-3">Recommended Videos</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {item.videos.map((vid, vidIdx) => (
                                            <a
                                                key={vidIdx}
                                                href={vid.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg group transition-all"
                                            >
                                                <div className="bg-[#FF0000] p-2.5 rounded-md group-hover:bg-[#333333] transition-colors">
                                                    <svg className="w-5 h-5 text-[#f5f5f5]" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-medium text-[#b0b0b0] group-hover:text-[#f5f5f5] transition-colors">{vid.title}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Revision;
