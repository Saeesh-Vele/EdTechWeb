import React from "react";
import { useNavigate } from "react-router-dom";
import { useCourseContext } from "../../../context/CourseContext";
import "./AllCourses.css";

const routeMap: Record<string, string> = {
    "GameDevelopment": "/dashboard/roadmap/game",
    "Backend": "/dashboard/roadmap/backend",
    "Android": "/dashboard/roadmap/android",
    "Full Stack": "/dashboard/roadmap/fullstack",
    "DevOps": "/dashboard/roadmap/devops",
    "Data Analyst": "/dashboard/roadmap/data-analyst",
    "AI Engineer": "/dashboard/roadmap/ai-engineer",
    "Data Engineer": "/dashboard/roadmap/data-engineer",
    "Machine Learning": "/dashboard/roadmap/machine-learning",
    "iOS": "/dashboard/roadmap/ios",
    "Blockchain": "/dashboard/roadmap/blockchain",
    "MlOps": "/dashboard/roadmap/mlops",
};

const courses = [
    "GameDevelopment", "Backend", "Full Stack", "DevOps",
    "MlOps", "Data Analyst", "AI Engineer", "iOS",
    "Data Engineer", "Android", "Machine Learning", "Blockchain"
];

const AllCourses = () => {
    const navigate = useNavigate();
    const { addCourse, isCourseAdded } = useCourseContext();

    const handleAddCourse = (e: React.MouseEvent, course: string) => {
        e.stopPropagation(); // Prevents navigating to the roadmap when clicking the Add button
        addCourse(course);
    };

    return (
        <div className="allcourses-wrapper">
            <div className="allcourses-header">
                <h1>Explore Courses</h1>
                <p>Choose a domain to start learning </p>
            </div>

            <div className="courses-grid">
                {courses.map((course, index) => {
                    const added = isCourseAdded(course);
                    return (
                        <div
                            className="course-card relative"
                            key={index}
                            onClick={() => {
                                if (routeMap[course]) {
                                    navigate(routeMap[course]);
                                }
                            }}
                        >
                            <div className="card-content">
                                <span className="course-name">{course}</span>
                            </div>

                            {/* glow effect */}
                            <div className="card-glow"></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AllCourses;