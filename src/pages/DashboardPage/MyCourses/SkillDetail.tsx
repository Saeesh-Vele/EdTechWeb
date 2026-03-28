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
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors"
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
        className="mb-8 px-4 py-2 border border-gray-700 bg-[#111827] text-gray-300 hover:text-white hover:border-gray-500 hover:bg-gray-800 rounded-lg text-sm flex items-center gap-2 transition-all"
      >
        ← Back to Course
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{skill.name}</h1>
        {skill.description && <p className="text-gray-400 text-lg">{skill.description}</p>}
      </div>

      <div className="space-y-8">
        {/* Notes Section */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <span>📝</span> Study Notes
          </h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-[15px]">
            {skill.notes}
          </div>
        </div>

        {/* Videos Section */}
        {skill.videos && skill.videos.length > 0 && (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <span>📺</span> Recommended Videos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skill.videos.map((video, index) => (
                <div key={index} className="flex flex-col gap-3">
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-800 shadow-md bg-black">
                    <iframe
                      className="w-full h-full"
                      src={getYouTubeEmbedUrl(video)}
                      title={`Video Reference ${index + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="text-sm text-gray-400 text-center font-medium">Part {index + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillDetail;
