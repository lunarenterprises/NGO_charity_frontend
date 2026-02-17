import React from 'react';
import { FaHandsHelping, FaRegCheckCircle } from 'react-icons/fa';

const StatsSection = () => {
    return (
        <div className="relative px-4 -mt-16 md:px-12 z-20">
            <div className="grid grid-cols-1 gap-4 p-5 bg-black shadow-xl md:grid-cols-3 rounded-2xl max-w-7xl mx-auto border border-white/10">
                {/* Stat 1 */}
                <div className="flex items-center gap-4 p-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Total Donations</p>
                        <h3 className="text-2xl font-bold text-white">₹1,10,000</h3>
                    </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-4 p-4 border-t md:border-t-0 md:border-l border-gray-800">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl text-gray-300 text-2xl ">

                        <FaHandsHelping />
                    </div>

                    <div className='flex flex-col justify-center items-center' >
                        <p className="text-sm text-gray-400">Active Projects</p>
                        <h3 className="text-2xl font-bold text-white">3</h3>
                    </div>
                </div>


                {/* Stat 3 */}
                <div className="flex items-center gap-4 p-4 border-t md:border-t-0 md:border-l border-gray-800">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl text-gray-300 text-2xl ">
                        <FaRegCheckCircle />
                    </div>

                    <div className='flex flex-col justify-center items-center' >
                        <p className="text-sm text-gray-400">Completed Projects</p>
                        <h3 className="text-2xl font-bold text-white">3</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsSection;
