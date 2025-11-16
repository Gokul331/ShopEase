import { useEffect } from "react";

// Alternative ScrollToTop implementation that can be used in individual components
// if the main ScrollToTop component doesn't work

/**
 * Utility function to scroll to top of page
 * @param {boolean} smooth - Whether to use smooth scrolling (default: true)
 */
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: smooth ? "smooth" : "instant",
  });
};

/**
 * Hook that automatically scrolls to top when component mounts
 * Usage: useScrollToTop() in any component
 */
export const useScrollToTop = () => {
  useEffect(() => {
    scrollToTop(false); // Instant scroll on mount
  }, []);
};

/**
 * Hook that scrolls to top when a specific value changes
 * Usage: useScrollOnChange(dependency)
 * @param {any} dependency - Value to watch for changes
 */
export const useScrollOnChange = (dependency) => {
  useEffect(() => {
    scrollToTop(true); // Smooth scroll on change
  }, [dependency]);
};

export default { scrollToTop, useScrollToTop, useScrollOnChange };
