import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Skill {
  id: string;
  name: string;
  description?: string;
  notes: string;
  videos: string[];
}

interface CourseData {
  domain: string;
  skills: Skill[];
}

const CourseDetail = () => {
  const { courseName } = useParams<{ courseName: string }>();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const formattedId = courseName?.toLowerCase().replace(/\s+/g, '');
        const data = await import(`../../../data/courses/${formattedId}.json`);
        setCourseData(data.default || data);
      } catch (e) {
        console.error("Course data not found", e);
        setCourseData(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseName) {
      fetchCourseData();
    }
  }, [courseName]);

  if (loading) {
    return (
      <div className="p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="p-8 text-white max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Course Details Not Found</h2>
        <p className="text-gray-400 mb-6">Sorry, we couldn't load the details for {courseName}. This domain might be missing its structured data file.</p>
        <button 
          onClick={() => navigate("/dashboard/my-courses")}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium"
        >
          Back to My Courses
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button 
        onClick={() => navigate("/dashboard/my-courses")}
        className="mb-6 text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center gap-2"
      >
        ← Back to My Courses
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{courseData.domain}</h1>
        <p className="text-gray-400">Select a skill to view your study notes and recommended videos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseData.skills?.map((skill, index) => (
          <div
            key={skill.id || index}
            className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-indigo-500 transition-colors flex flex-col h-full"
          >
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{skill.name}</h3>
              <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                {skill.description || "Detailed notes and resources on this topic."}
              </p>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-800/50">
              <button 
                onClick={() => navigate(`/dashboard/my-courses/${encodeURIComponent(courseName!)}/${encodeURIComponent(skill.id || skill.name.toLowerCase().replace(/\s+/g, '-'))}`)}
                className="w-full px-4 py-2 border border-indigo-600 hover:bg-indigo-600/10 text-indigo-400 rounded-lg transition-colors text-sm font-medium text-center"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {(!courseData.skills || courseData.skills.length === 0) && (
        <div className="p-8 bg-[#111827] border border-gray-800 rounded-xl text-center text-gray-400">
          No skills are available yet for this course.
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
