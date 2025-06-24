import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "react-feather";

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center py-20">
      <AlertTriangle size={48} className="text-yellow-500 mb-4" />
      <h1 className="text-4xl font-bold mb-2 text-gray-800">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-500 mb-6">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
