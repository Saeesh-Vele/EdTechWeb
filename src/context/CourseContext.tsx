import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { db, auth } from "../firebase/config";
import { onSnapshot, collection, setDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { logActivity } from "../utils/activityLogger";
import { onAuthStateChanged, type User } from "firebase/auth";

interface CourseContextType {
  myCourses: string[];
  addCourse: (course: string) => Promise<void>;
  removeCourse: (course: string) => Promise<void>;
  isCourseAdded: (course: string) => boolean;
  loadingCourses: boolean;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [myCourses, setMyCourses] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setMyCourses([]);
        setLoadingCourses(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore Sync
  useEffect(() => {
    if (!user) return;
    
    setLoadingCourses(true);
    const coursesRef = collection(db, "users", user.uid, "courses");
    
    const unsubscribe = onSnapshot(coursesRef, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => doc.data().name as string);
      setMyCourses(coursesData);
      setLoadingCourses(false);
    }, (error) => {
      console.error("Error fetching courses realtime:", error);
      setLoadingCourses(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addCourse = async (course: string) => {
    if (!user) {
      console.warn("Must be logged in to add courses");
      return;
    }
    if (myCourses.includes(course)) return;
    
    const courseId = course.replace(/\s+/g, '-').toLowerCase(); 
    const courseRef = doc(db, "users", user.uid, "courses", courseId);
    
    try {
      await setDoc(courseRef, {
        name: course,
        addedAt: serverTimestamp()
      });
      // Log to Recent Activity feed
      logActivity('course_enrolled', `Enrolled in ${course}`, `course_enrolled::${course}`);
    } catch (e) {
      console.error("Error adding course", e);
    }
  };

  const removeCourse = async (course: string) => {
    if (!user) return;
    const courseId = course.replace(/\s+/g, '-').toLowerCase(); 
    const courseRef = doc(db, "users", user.uid, "courses", courseId);
    try {
      await deleteDoc(courseRef);
    } catch (e) {
      console.error("Error removing course", e);
    }
  };

  const isCourseAdded = (course: string) => {
    return myCourses.includes(course);
  };

  return (
    <CourseContext.Provider value={{ myCourses, addCourse, removeCourse, isCourseAdded, loadingCourses }}>
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
