import React, { useState, useEffect } from 'react';
import StatsSection from './StatsSection';
import FeaturedCampaigns from './FeaturedCampaigns';
import CompletedProjects from './CompletedProjects';
import { getActiveBannersApi } from '../../Services/adminApi';
import { Link } from 'react-router-dom';
import LoadingScreen from '../../Components/LoadingScreen';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";

function LandingPage({ onQuickDonationOpen }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [featuredLoaded, setFeaturedLoaded] = useState(false);
  const [completedLoaded, setCompletedLoaded] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await getActiveBannersApi();
        if (response?.data?.banners?.length) {
          setBanners(response.data.banners);
        } else if (response?.data?.data?.length) {
          setBanners(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch banners for landing page:', error);
      } finally {
        setDataLoaded(true);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    // If no banners, we should not block on images
    if (dataLoaded && banners.length === 0) {
      setImageLoaded(true);
    }
  }, [dataLoaded, banners.length]);

  useEffect(() => {
    if (dataLoaded && imageLoaded && featuredLoaded && completedLoaded) {
      // Add a tiny delay for smoother transition
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataLoaded, imageLoaded, featuredLoaded, completedLoaded]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="min-h-screen font-sans">
      <LoadingScreen isVisible={loading} />
      
      {/* Hero Section */}
      <div className="relative w-full min-h-[600px] h-auto md:h-[700px] bg-black overflow-hidden">
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          {banners.length > 0 ? (
            banners.map((banner, index) => (
              <div
                key={banner._id || banner.id || index}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === currentImageIndex
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-110'
                  }`}
              >
                <img
                  src={banner.imageUrl || banner.url}
                  alt={`Hero background ${index + 1}`}
                  className="object-cover w-full h-full opacity-50"
                  onLoad={() => {
                    if (index === 0) setImageLoaded(true);
                  }}
                  onError={e => { 
                    e.target.src = FALLBACK_IMAGE; 
                    if (index === 0) setImageLoaded(true);
                  }}
                />
              </div>
            ))
          ) : (
            <div className="absolute inset-0 transition-all duration-1000 ease-in-out transform opacity-100 scale-100">
              <img
                src={FALLBACK_IMAGE}
                alt={`Hero background fallback`}
                className="object-cover w-full h-full opacity-50"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-r from-gray-900 via-black/10 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center h-full px-4 text-center text-white pt-24 pb-20 md:pt-20 md:pb-32">

          {/* Trusted Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-3 mb-6 text-sm font-medium bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <span>Trusted by 10,000+ Donors</span>
          </div>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
            Empower Change, <br />
            <span className="text-gray-300">Transform Lives</span>
          </h1>

          <p className="max-w-2xl mt-6 text-base text-gray-200 md:text-xl">
            Join thousands of compassionate individuals making a real difference.
            Every rupee you donate goes directly to those in need.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto px-4 sm:px-0 max-w-sm sm:max-w-none">
            <button
              onClick={onQuickDonationOpen}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 font-semibold text-black transition bg-white rounded-lg hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              Quick Donation
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
            <Link to="/active-projects" className="w-full sm:w-auto">
              <button className="w-full flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition border border-gray-400 rounded-lg hover:bg-white/10 text-center">
                View Projects
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </Link>

          </div>
        </div>
      </div>

      <StatsSection />

      <FeaturedCampaigns onLoad={() => setFeaturedLoaded(true)} />
      <CompletedProjects onLoad={() => setCompletedLoaded(true)} />
    </div>

  );
}

export default LandingPage;
