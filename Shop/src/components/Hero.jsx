import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bannerAPI } from "../services/api";
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiArrowRight,
  FiShoppingBag,
  FiPause,
  FiPlay
} from "react-icons/fi";

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const response = await bannerAPI.list();
        if (mounted) {
          setBanners(response.data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Hero fetch failed:", err);
        if (mounted) setIsLoading(false);
      }
    };

    fetchBanners();

    return () => (mounted = false);
  }, []);

  // Auto-advance with pause on hover
  useEffect(() => {
    if (!isAutoPlaying || banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length, isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((i) => (i + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((i) => (i - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (isLoading) {
    return (
      <section className="relative h-80 md:h-96 bg-gray-200 rounded-2xl overflow-hidden animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading banners...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <section className="relative h-80 md:h-96 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Welcome to ShopEase</h2>
          <p className="text-lg mb-6">Discover amazing products at great prices</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <FiShoppingBag />
            Start Shopping
          </Link>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <section 
      className="relative h-80 md:h-60 lg:h-[400px] rounded-2xl overflow-hidden shadow-2xl"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides */}
      <div className="relative h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex 
                ? "opacity-100 transform translate-x-0" 
                : "opacity-0 transform translate-x-4"
            }`}
          >
            {/* Background Image */}
            <img
              src={banner.image || `https://picsum.photos/seed/${banner.title}/1200/600`}
              alt={banner.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl text-white">
                  {/* Badge */}
                  {banner.badge && (
                    <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/30">
                      {banner.badge}
                    </span>
                  )}
                  
                  {/* Title */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                    {banner.title}
                  </h1>
                  
                  {/* Subtitle */}
                  <p className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-8">
                    {banner.subtitle}
                  </p>
                  
                  {/* CTA Button */}
                  {banner.cta_link && banner.cta_text && (
                    <Link
                      to={banner.cta_link}
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                    >
                      {banner.cta_text}
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 group"
        aria-label="Previous slide"
      >
        <FiChevronLeft className="text-2xl group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 group"
        aria-label="Next slide"
      >
        <FiChevronRight className="text-2xl group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={toggleAutoPlay}
        className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
      >
        {isAutoPlaying ? <FiPause /> : <FiPlay />}
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? "bg-white scale-125" 
                : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
        {currentIndex + 1} / {banners.length}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div 
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{ 
            width: isAutoPlaying ? '100%' : '0%',
            transition: isAutoPlaying ? 'width 5s linear' : 'none'
          }}
          key={currentIndex}
        />
      </div>
    </section>
  );
};

export default Hero;