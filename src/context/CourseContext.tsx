import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface CourseContextType {
  myCourses: string[];
  addCourse: (course: string) => void;
  removeCourse: (course: string) => void;
  isCourseAdded: (course: string) => boolean;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [myCourses, setMyCourses] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("my_courses");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load courses from localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("my_courses", JSON.stringify(myCourses));
  }, [myCourses]);

  const addCourse = (course: string) => {
    setMyCourses((prev) => {
      if (!prev.includes(course)) {
        return [...prev, course];
      }
      return prev;
    });
  };

  const removeCourse = (course: string) => {
    setMyCourses((prev) => prev.filter((c) => c !== course));
  };

  const isCourseAdded = (course: string) => {
    return myCourses.includes(course);
  };

  return (
    <CourseContext.Provider value={{ myCourses, addCourse, removeCourse, isCourseAdded }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourseContext = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error("useCourseContext must be used within a CourseProvider");
  }
  return context;
};
