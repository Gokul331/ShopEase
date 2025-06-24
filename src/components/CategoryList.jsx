import React from "react";
import { motion } from "framer-motion";
import { categories} from "../data/categories"


const CategoryList = () => (
  <div className="flex flex-col items-center justify-center">
    <div className="pt-36 sm:pt-24 md:pt-20 w-full flex justify-center">
      <div className="flex overflow-x-auto gap-4 py-2 scrollbar-thick scrollbar-thumb-indigo-300 scrollbar-track-indigo-100">
        {categories.map(({ title, img }) => (
          <motion.div
            key={title}
            whileHover={{
              scale: 1.08,
              backgroundColor: "#6366f1",
              color: "#fff",
              boxShadow: "0 8px 24px 0 rgba(99,102,241,0.15)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="flex flex-col items-center min-w-[90px] px-2 py-3 bg-white border-2 rounded-lg shadow-xl cursor-pointer text-center select-none transition-colors duration-200"
          >
            <img
              src={img}
              alt={title}
              className="w-12 h-12 rounded-full object-cover mb-2 border border-indigo-100"
              loading="lazy"
            />
            <span className="text-xs font-medium text-indigo-700">{title}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default CategoryList;
