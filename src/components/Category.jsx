import React, { useRef } from "react";
import { motion } from "framer-motion";
import { categoryItems } from "../data/categoryItems";
import { ChevronLeft, ChevronRight } from "react-feather";

// Usage: <Category category="Electronics" />
const Category = ({ category }) => {
  const items = categoryItems[category] || [];
  const containerRef = useRef(null);

  // Scroll handler for left/right buttons
  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 300;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-12">
      <h2 className="text-2xl font-semibold text-black text-left">
        {category}
      </h2>
      <div className="relative">
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-indigo-100 transition disabled:opacity-30"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft size={28} className="text-indigo-600" />
        </button>
        <div
          ref={containerRef}
          className="flex gap-8 py-4 px-10 overflow-x-auto scroll-smooth custom-thin-scrollbar"
          style={{ scrollBehavior: "smooth" }}
        >
          {items.map(({ title, img }) => (
            <motion.div
              key={title}
              whileHover={{
                scale: 1.1,
                backgroundColor: "#6366f1",
                color: "#fff",
                boxShadow: "0 8px 32px 0 rgba(99,102,241,0.18)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="flex flex-col items-center min-w-[160px] h-48 mb-3 px-4 py-6 bg-white rounded-2xl shadow-lg cursor-pointer text-center select-none transition-colors duration-200"
            >
              <img
                src={img}
                alt={title}
                className="w-24 h-24 rounded-xl object-cover mb-3 border-2 border-indigo-200 shadow"
                loading="lazy"
              />
              <span className="text-lg font-semibold text-indigo-700">
                {title}
              </span>
            </motion.div>
          ))}
        </div>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-indigo-100 transition disabled:opacity-30"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight size={28} className="text-indigo-600" />
        </button>
      </div>
      {/* Custom scrollbar styles */}
      <style>
        {`
          .custom-thin-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #a5b4fc #e0e7ff;
          }
          .custom-thin-scrollbar::-webkit-scrollbar {
            height: 5px;
          }
          .custom-thin-scrollbar::-webkit-scrollbar-thumb {
            background: #a5b4fc;
            border-radius: 8px;
          }
          .custom-thin-scrollbar::-webkit-scrollbar-track {
            background: #e0e7ff;
            border-radius: 8px;
          }
        `}
      </style>
    </div>
  );
};

export default Category;
