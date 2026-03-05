import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn
} from 'react-icons/fa';
import { addEnquiryApi } from '../../Services/userApi';
import { showAlert } from '../../Utils/alert';

const Footer = ({ onQuickDonationOpen }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        message: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEnquirySubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullname || !formData.email || !formData.message) {
            showAlert("Required", "All fields are required", "error");
            return;
        }

        setLoading(true);
        try {
            const result = await addEnquiryApi(formData);
            if (result.status === 200 || result.status === 201) {
                showAlert("Success", "Enquiry submitted successfully!", "success");
                setFormData({ fullname: '', email: '', message: '' });
            } else {
                showAlert("Failed", result.response?.data?.message || "Failed to submit enquiry", "error");
            }
        } catch (err) {
            showAlert("Error", "Something went wrong. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };
    return (
        <footer className="bg-black text-white pt-20 pb-10 px-6 lg:px-12 font-sans border-t border-gray-800">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

                {/* Branding & About */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-4">
                        <Link to="/" className="text-3xl font-black tracking-tighter uppercase italic block">
                            Yashfi  <span className="text-gray-500">Foundation</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            Building a sustainable future through transparent action and community empowerment. Every contribution creates waves of change.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Follow Our Journey</h4>
                        <div className="flex gap-4">
                            {[
                                { icon: <FaFacebookF />, label: 'Facebook' },
                                { icon: <FaTwitter />, label: 'Twitter' },
                                { icon: <FaInstagram />, label: 'Instagram' },
                                { icon: <FaLinkedinIn />, label: 'LinkedIn' }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    aria-label={social.label}
                                    className="w-10 h-10 border border-gray-800 rounded flex items-center justify-center text-sm hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="lg:col-span-3 space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Navigate</h4>
                    <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                        <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                        <li><Link to="/active-projects" className="hover:text-white transition-colors">Active Projects</Link></li>
                        <li><Link to="/completed-projects" className="hover:text-white transition-colors">Completed Projects</Link></li>
                        <li><Link to="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
                        <li>
                            <button
                                onClick={onQuickDonationOpen}
                                className="hover:text-white transition-colors text-left uppercase"
                            >
                                Donate Now
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Contact Form Section */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold tracking-tight">Stay Connected</h3>
                        <p className="text-gray-500 text-sm">Have questions? Send us a direct message.</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleEnquirySubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 block px-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleInputChange}
                                    placeholder="Enter your name"
                                    className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-3 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-white transition-colors"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 block px-1">Email ID</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-3 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-white transition-colors"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 block px-1">Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="How can we help you?"
                                rows="3"
                                className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-3 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-white transition-colors resize-none"
                            ></textarea>
                        </div>
                        <button
                            disabled={loading}
                            className="w-full bg-white text-black font-black py-4 rounded uppercase text-[10px] tracking-[0.2em] hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Initialize Enquiry'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                    © 2026 NGO Charity Organization. Empowering Change.
                </p>
                <div className="flex gap-8 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-white transition-colors">Cookies</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
