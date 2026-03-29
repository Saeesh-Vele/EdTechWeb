import React from "react";
import { useNavigate } from "react-router-dom";
import { useCourseContext } from "../../../context/CourseContext";
import ModuleList from "../../../components/ModuleList";

const MyCoursesList = () => {
    const { myCourses, removeCourse } = useCourseContext();
    const navigate = useNavigate();

    const courseItems = myCourses.map(course => ({
        id: course,
        name: course,
        description: `Explore all skills, study notes, and video resources associated with ${course}.`,
    }));

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">My Courses</h1>
                <p className="text-gray-400">Manage and continue learning your selected domains.</p>
            </div>

            {myCourses.length === 0 ? (
                <div className="module-empty" style={{ padding: '48px 24px' }}>
                    <span className="text-4xl mb-4 block">📚</span>
                    <h2 className="text-xl font-semibold text-white mb-2">You haven't added any courses yet</h2>
                    <p className="text-gray-400 mb-6">Explore our available domains and add them to your collection.</p>
                    <button 
                        onClick={() => navigate("/dashboard/allcourses")}
                        className="px-6 py-2 bg-white hover:bg-gray-200 text-black rounded-lg transition-colors font-medium"
                    >
                        Explore Courses
                    </button>
                </div>
            ) : (
                <ModuleList
                    items={courseItems}
                    onItemClick={(item) => navigate(`/dashboard/my-courses/${encodeURIComponent(item.name)}`)}
                    actionLabel="View Course"
                    secondaryAction={(item) => ({
                        label: "Remove",
                        onClick: () => removeCourse(item.name),
                    })}
                />
            )}
        </div>
    );
};

export default MyCoursesList;

