import React from "react";
import { useNavigate } from "react-router-dom";
import { useCourseContext } from "../../../context/CourseContext";

const MyCoursesList = () => {
    const { myCourses, removeCourse } = useCourseContext();
    const navigate = useNavigate();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">My Courses</h1>
                <p className="text-gray-400">Manage and continue learning your selected domains.</p>
            </div>

            {myCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-[#111827] border border-gray-800 rounded-xl text-center">
                    <span className="text-4xl mb-4">📚</span>
                    <h2 className="text-xl font-semibold text-white mb-2">You haven't added any courses yet</h2>
                    <p className="text-gray-400 mb-6">Explore our available domains and add them to your collection.</p>
                    <button 
                        onClick={() => navigate("/dashboard/allcourses")}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                    >
                        Explore Courses
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCourses.map(course => (
                        <div key={course} className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors flex flex-col h-full">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2">{course}</h3>
                                <p className="text-gray-400 text-sm mb-6">
                                    Explore all skills, study notes, and video resources associated with {course}.
                                </p>
                            </div>
                            <div className="flex gap-3 mt-auto pt-4 border-t border-gray-800/50">
                                <button 
                                    onClick={() => navigate(`/dashboard/my-courses/${encodeURIComponent(course)}`)}
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium text-center"
                                >
                                    View Course
                                </button>
                                <button 
                                    onClick={() => removeCourse(course)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCoursesList;
