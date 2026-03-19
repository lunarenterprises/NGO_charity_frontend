import React, { useEffect, useState } from 'react';

const LoadingScreen = ({ isVisible }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 800); // Wait for fade-out animation
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white transition-opacity duration-700 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Yashfi Foundation Theme Logo / Animation */}
        <div className="relative w-24 h-24 mb-6">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
          {/* Animated Spinner Ring */}
          <div className="absolute inset-0 border-4 border-t-black border-l-black border-r-transparent border-b-transparent rounded-full animate-spin"></div>
          
          {/* Center Icon (Heart) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-10 h-10 text-black animate-pulse"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
        </div>

        {/* Text Animation */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-black mb-2 animate-pulse">
            Yashfi <span className="text-gray-400">Foundation</span>
          </h2>
          <div className="flex items-center gap-1.5 justify-center">
            <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Background Micro-Interactions */}
      <div className="absolute bottom-10 text-gray-400 text-sm font-medium tracking-widest uppercase">
        Empowering Change
      </div>
    </div>
  );
};

export default LoadingScreen;
