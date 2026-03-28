import React from "react";
import { useNavigate } from "react-router-dom";
import "./AllCourses.css";

const courses = [
    "GameDevelopment", "Backend", "Full Stack", "DevOps",
    "DevSecOps", "Data Analyst", "AI Engineer", "AI & Data Scientist",
    "Data Engineer", "Android", "Machine Learning", "PostgreSQL",
    "iOS", "Blockchain", "QA", "UX Design"
];

const AllCourses = () => {
    const navigate = useNavigate();

    return (
        <div className="allcourses-wrapper">
            <div className="allcourses-header">
                <h1>Explore Courses</h1>
                <p>Choose a domain to start learning 🚀</p>
            </div>

            <div className="courses-grid">
                {courses.map((course, index) => (
                    <div
                        className="course-card"
                        key={index}
                        onClick={() => {
                            if (course === "GameDevelopment") {
                                navigate("/dashboard/roadmap/game");
                            }
                        }}
                    >
                        <div className="card-content">
                            <span className="course-name">{course}</span>

                        </div>

                        <div className="bookmark">🔖</div>

                        {/* glow effect */}
                        <div className="card-glow"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllCourses;