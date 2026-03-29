import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModuleList from "../../../components/ModuleList";

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
          className="px-6 py-2 bg-white hover:bg-gray-200 rounded-lg text-black font-medium transition-colors"
        >
          Back to My Courses
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate("/dashboard/my-courses")}
        className="mb-6 text-gray-400 hover:text-white font-medium text-sm flex items-center gap-2 transition-colors"
      >
        ← Back to My Courses
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{courseData.domain}</h1>
        <p className="text-gray-400">Select a module to view your study notes and recommended videos.</p>
      </div>

      <ModuleList
        items={courseData.skills}
        onItemClick={(skill) =>
          navigate(
            `/dashboard/my-courses/${encodeURIComponent(courseName!)}/${encodeURIComponent(
              skill.id || skill.name.toLowerCase().replace(/\s+/g, "-")
            )}`
          )
        }
        actionLabel="View Details"
        emptyMessage="No skills are available yet for this course."
      />
    </div>
  );
};

export default CourseDetail;
