import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Create() {
  const [, navigate] = useLocation();
  
  // Redirect to role selection instead of showing create form
  useEffect(() => {
    navigate("/role-selection");
  }, [navigate]);

  // Return null or loading indicator while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Redirecting to role selection...</p>
      </div>
    </div>
  );
}