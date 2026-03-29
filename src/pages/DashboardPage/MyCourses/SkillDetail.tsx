import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Skill {
  id?: string;
  name: string;
  description?: string;
  notes: string;
  videos: string[];
}

const SkillDetail = () => {
  const { courseName, skillName } = useParams<{ courseName: string; skillName: string }>();
  const navigate = useNavigate();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkillData = async () => {
      setLoading(true);
      try {
        const formattedId = courseName?.toLowerCase().replace(/\s+/g, '');
        const data = await import(`../../../data/courses/${formattedId}.json`);
        const courseData = data.default || data;
        
        // Match by id if present, otherwise approximate match by formatted name
        const foundSkill = courseData.skills?.find((s: Skill) => 
          s.id === skillName || 
          s.name.toLowerCase().replace(/\s+/g, '-') === skillName
        );
        
        setSkill(foundSkill || null);
      } catch (e) {
        console.error("Skill data not found", e);
        setSkill(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseName && skillName) {
      fetchSkillData();
    }
  }, [courseName, skillName]);

  if (loading) {
    return (
      <div className="p-8 text-white max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold">Loading...</h2>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="p-8 text-white max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Skill Not Found</h2>
        <p className="text-gray-400 mb-6">Could not find the requested skill.</p>
        <button 
          onClick={() => navigate(`/dashboard/my-courses/${courseName}`)}
          className="px-6 py-2 bg-white hover:bg-gray-200 rounded-lg text-black font-medium transition-colors"
        >
          Back to Course
        </button>
      </div>
    );
  }

  // Helper to extract youtube ID for iframe embedding
  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('embed/')) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(`/dashboard/my-courses/${courseName}`)}
        className="mb-8 px-4 py-2 border border-gray-700 bg-[#141414] text-gray-300 hover:text-white hover:border-gray-500 hover:bg-gray-800 rounded-lg text-sm flex items-center gap-2 transition-all"
      >
        ← Back to Course
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{skill.name}</h1>
        {skill.description && <p className="text-gray-400 text-lg">{skill.description}</p>}
      </div>

      <div className="space-y-8">
        {/* Video Section — Primary Player */}
        {skill.videos && skill.videos.length > 0 && (
          <div className="video-section">
            {skill.videos.map((video, index) => (
              <div key={index} className="video-block">
                <div className="video-player">
                  <iframe
                    src={getYouTubeEmbedUrl(video)}
                    title={`Video Reference ${index + 1}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                {skill.videos.length > 1 && (
                  <p className="video-label">Part {index + 1}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Notes Section */}
        <div className="notes-section">
          <h2 className="notes-section__title">
            📝 Study Notes
          </h2>
          <div className="notes-section__body">
            {skill.notes}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDetail;
