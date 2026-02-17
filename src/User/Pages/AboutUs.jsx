import React from 'react';
import { FaBullseye, FaEye, FaHeart, FaUsers, FaGlobe, FaSeedling } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AboutUs = ({ onQuickDonationOpen }) => {
    const navigate = useNavigate();

    const values = [
        {
            icon: <FaHeart className="w-6 h-6" />,
            title: "Compassion",
            description: "At the heart of everything we do is a deep-seated empathy for the individuals and communities we serve.",
            hoverBg: "hover:bg-rose-600"
        },
        {
            icon: <FaGlobe className="w-6 h-6" />,
            title: "Inclusivity",
            description: "We believe that everyone deserves equal access to opportunities, regardless of their background or circumstances.",
            hoverBg: "hover:bg-blue-600"
        },
        {
            icon: <FaSeedling className="w-6 h-6" />,
            title: "Sustainability",
            description: "Our projects are designed to create lasting change, empowering communities to thrive long after we're gone.",
            hoverBg: "hover:bg-teal-600"
        },
        {
            icon: <FaUsers className="w-6 h-6" />,
            title: "Collaboration",
            description: "We work hand-in-hand with local partners, donors, and volunteers to maximize our collective impact.",
            hoverBg: "hover:bg-indigo-600"
        }
    ];



    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden bg-black text-white">
                <div className="absolute inset-0 opacity-20">
                    <img
                        src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest uppercase bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                        Our Vision
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
                        Paving the way for <br />
                        <span className="text-gray-400">a brighter tomorrow.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 leading-relaxed font-medium">
                        HopeConnect is a global community of change-makers dedicated to tackling the most pressing challenges of our time through innovation and empathy.
                    </p>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-3 p-4 rounded-2xl">
                                <FaBullseye className="w-8 h-8 text-black" />
                                <div>
                                    <h3 className="text-xl font-bold text-black uppercase">Our Mission</h3>
                                    <p className="text-sm text-gray-500 font-medium">What drives us forward every day.</p>
                                </div>
                            </div>
                            <p className="text-xl md:text-2xl text-gray-700 leading-snug font-semibold">
                                To empower marginalized communities through sustainable resources and education, fostering deep-rooted change for every individual to thrive.
                            </p>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-black/5 rounded-[40px] transform group-hover:scale-105 transition-transform duration-500"></div>
                            <img
                                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                                alt="Mission"
                                className="relative rounded-[32px] shadow-2xl z-10 w-full h-[400px] object-cover"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mt-32">
                        <div className="order-2 md:order-1 relative group">
                            <div className="absolute -inset-4 bg-black/5 rounded-[40px] transform group-hover:scale-105 transition-transform duration-500"></div>
                            <img
                                src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                                alt="Vision"
                                className="relative rounded-[32px] shadow-2xl z-10 w-full h-[400px] object-cover"
                            />
                        </div>
                        <div className="order-1 md:order-2 space-y-8">
                            <div className="inline-flex items-center gap-3 p-4 bg-white rounded-2xl">
                                <FaEye className="w-8 h-8 text-black" />
                                <div>
                                    <h3 className="text-xl font-bold text-black uppercase">Our Vision</h3>
                                    <p className="text-sm text-gray-500 font-medium">The future we are building together.</p>
                                </div>
                            </div>
                            <p className="text-xl md:text-2xl text-gray-700 leading-snug font-semibold">
                                A world of compassion where poverty is eradicated and everyone lives with dignity, purpose, and the hope to reach their full potential.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-32 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                        <div className="max-w-2xl">
                            <span className="text-black font-bold uppercase tracking-[0.2em] text-sm mb-4 block">Our Principles</span>
                            <h2 className="text-4xl md:text-6xl font-bold text-black tracking-tight leading-none">The values that <br />define us.</h2>
                        </div>
                        <p className="text-gray-500 max-w-sm font-medium text-lg leading-relaxed">
                            These core principles guide every decision we make and every action we take across the globe.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100 border border-gray-100 rounded-[48px] overflow-hidden">
                        {values.map((v, i) => (
                            <div key={i} className={`group relative p-12 md:p-16 bg-white ${v.hoverBg} transition-all duration-1000 ease-in-out overflow-hidden`}>
                                {/* Number backdrop */}
                                <span className="absolute -top-10 -right-4 text-[12rem] font-bold text-gray-50 group-hover:text-white/10 transition-colors duration-1000 select-none">
                                    0{i + 1}
                                </span>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 mb-10 bg-black text-white rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 transform group-hover:scale-110">
                                        {v.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-black group-hover:text-white mb-6 transition-colors duration-500">{v.title}</h3>
                                    <p className="text-gray-500 text-lg leading-relaxed font-medium group-hover:text-gray-400 transition-colors duration-500 max-w-sm">
                                        {v.description}
                                    </p>
                                </div>

                                {/* Arrow icon on hover */}
                                <div className="absolute bottom-12 right-12 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                                    <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story section */}
            <section className="py-24 bg-black text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col lg:flex-row gap-16 lg:items-center">
                        <div className="lg:w-1/2">
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-6 block">Our Story</span>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">From a small spark to a global movement.</h2>
                            <div className="space-y-6 text-lg text-gray-400 font-medium leading-relaxed">
                                <p>
                                    Founded in 2012 by Sarah Johnson, HopeConnect began as a local initiative in a small community center. Our first project was simply providing school supplies to local children.
                                </p>
                                <p>
                                    Today, we operate in 12 countries, impacting over 100,000 lives annually. Our journey has been defined by the thousands of volunteers and donors who shared our vision of a better world.
                                </p>
                                <p>
                                    We've faced challenges, but our commitment has only grown stronger. Every life transformed is a testament to the power of collective action.
                                </p>
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="History 1" className="rounded-3xl h-48 w-full object-cover shadow-2xl" />
                                    <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="History 2" className="rounded-3xl h-64 w-full object-cover shadow-2xl" />
                                </div>
                                <div className="space-y-4 pt-8">
                                    <img src="https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="History 3" className="rounded-3xl h-64 w-full object-cover shadow-2xl" />
                                    <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="History 4" className="rounded-3xl h-48 w-full object-cover shadow-2xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto bg-gray-100 rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-8">Be part of the solution.</h2>
                        <p className="text-lg text-gray-600 font-medium mb-12 max-w-xl mx-auto leading-relaxed">Whether you want to volunteer, donate, or partner with us, your contribution makes a meaningful impact.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={onQuickDonationOpen}
                                className="px-10 py-5 bg-black text-white font-bold rounded-2xl hover:bg-gray-900 transition-all transform hover:-translate-y-1 shadow-xl shadow-black/10"
                            >
                                Quick Donation
                            </button>
                            <button
                                onClick={() => navigate('/active-projects')}
                                className="px-10 py-5 bg-white border-2 border-black text-black font-bold rounded-2xl hover:bg-black hover:text-white transition-all transform hover:-translate-y-1"
                            >
                                Donate on a Project
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
