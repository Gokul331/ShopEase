import React from "react";
import { motion } from "framer-motion";

const loaderVariants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 1.2,
      ease: "linear",
    },
  },
};

const dotVariants = {
  initial: { scale: 1, opacity: 0.5 },
  animate: {
    scale: [1, 1.4, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      repeat: Infinity,
      duration: 1.2,
      ease: "easeInOut",
      staggerChildren: 0.2,
    },
  },
};

const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-pink-100 z-50">
    <motion.div
      className="mb-6"
      variants={loaderVariants}
      animate="animate"
      style={{
        width: 70,
        height: 70,
        borderRadius: "50%",
        border: "6px solid #a5b4fc",
        borderTop: "6px solid #ec4899",
        boxSizing: "border-box",
      }}
    />
    <div className="flex space-x-2 mb-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-full bg-indigo-400"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: i * 0.2 }}
        />
      ))}
    </div>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="text-lg font-semibold text-indigo-600 tracking-wide"
    >
      Loading ShopEase...
    </motion.div>
  </div>
);

export default PageLoader;
