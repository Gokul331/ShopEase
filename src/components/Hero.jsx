import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Tag } from "react-feather";
import { Link } from "react-router-dom";

const Hero = () => {
  const banners = [
    {
      id: 1,
      type: "festival",
      title: "Summer Festival Sale",
      subtitle: "Up to 60% Off Everything",
      discountRange: "30%-60% OFF",
      cta: "Shop Now",
      bgColor: "from-indigo-500 to-purple-600",
      textColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: 2,
      type: "category",
      category: "Electronics",
      title: "Tech Super Savings",
      discountRange: "40-50% OFF",
      cta: "Explore Electronics",
      bgColor: "from-blue-500 to-cyan-400",
      textColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: 3,
      type: "category",
      category: "Fashion",
      title: "Summer Wardrobe Refresh",
      discountRange: "35-55% OFF",
      cta: "Discover Fashion",
      bgColor: "from-pink-500 to-rose-500",
      textColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: 4,
      type: "category",
      category: "Home & Kitchen",
      title: "Home Essentials Sale",
      discountRange: "25-45% OFF",
      cta: "Browse Home Goods",
      bgColor: "from-amber-500 to-yellow-400",
      textColor: "text-gray-900",
      image:
        "https://images.unsplash.com/photo-1583845112203-29329902330b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: 5,
      type: "category",
      category: "Beauty",
      title: "Glow Up Special",
      discountRange: "20-40% OFF",
      cta: "Shop Beauty",
      bgColor: "from-purple-500 to-fuchsia-500",
      textColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
  ];

  const [currentBanner, setCurrentBanner] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, banners.length]);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToBanner = (index) => {
    setCurrentBanner(index);
  };

  return (
    <section
      className="relative h-[340px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Centered and width-constrained container */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <div className="w-full max-w-7xl h-full pointer-events-auto relative px-6 ">
          {/* Banners */}
          <div className="relative h-full">
            {banners.map((banner, index) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: index === currentBanner ? 1 : 0,
                  zIndex: index === currentBanner ? 10 : 1,
                }}
                transition={{ duration: 0.8 }}
                className={`absolute inset-0 bg-gradient-to-r ${banner.bgColor} flex items-center rounded-lg`}
              >
                {/* Background image with overlay */}
                <div className="absolute inset-0">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover opacity-20"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>

                {/* Content */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className={`${banner.textColor}`}
                    >
                      {banner.type === "festival" ? (
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                            transition: { duration: 2, repeat: Infinity },
                          }}
                          className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6"
                        >
                          <Tag className="mr-2" />
                          <span className="font-bold">
                            {banner.discountRange}
                          </span>
                        </motion.div>
                      ) : (
                        <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                          {banner.category} · {banner.discountRange}
                        </div>
                      )}

                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                        {banner.title}
                      </h1>

                      {banner.subtitle && (
                        <p className="text-xl md:text-2xl mb-6">
                          {banner.subtitle}
                        </p>
                      )}

                      <Link
                        to={
                          banner.type === "festival"
                            ? "/deals"
                            : `/category/${banner.category?.toLowerCase()}`
                        }
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-6 py-3 rounded-lg flex items-center ${
                            banner.textColor === "text-white"
                              ? "bg-white text-gray-900"
                              : "bg-gray-900 text-white"
                          }`}
                        >
                          <ShoppingBag className="mr-2" />
                          {banner.cta}
                        </motion.button>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prevBanner}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Indicator dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToBanner(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentBanner ? "bg-white w-6" : "bg-white/50"
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
