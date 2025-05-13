"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
    // State for paw prints to avoid hydration errors
    const [pawPrints, setPawPrints] = useState([]);

    // Generate paw prints only on client-side after mount
    useEffect(() => {
        const prints = Array(8).fill(0).map((_, i) => ({
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.4,
            delay: i * 0.5,
            duration: 5 + Math.random() * 5,
            direction: i % 2 === 0 ? 10 : -10
        }));
        setPawPrints(prints);
    }, []);

    return (
        <footer className="relative bg-gradient-to-b from-amber-50 to-amber-100/70 pt-16 pb-8 overflow-hidden">
            {/* Animated paw prints background - Fixed hydration error */}
            <div className="absolute inset-0 opacity-10 z-0 pointer-events-none">
                {pawPrints.map((paw, i) => (
                    <motion.div
                        key={i}
                        className="absolute"
                        initial={{
                            top: paw.top,
                            left: paw.left,
                            opacity: paw.opacity
                        }}
                        animate={{
                            y: [0, -10, 0],
                            rotate: [0, paw.direction, 0]
                        }}
                        transition={{
                            duration: paw.duration,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: paw.delay
                        }}
                    >
                        <div className="text-4xl">🐾</div>
                    </motion.div>
                ))}
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Logo Section - Fixed spacing issue */}
                    <div className="lg:col-span-2">
                        <div className="flex flex-col items-center md:items-start">
                            {/* Logo with proper spacing */}
                            <div className="mb-6">
                                <Image
                                    src="/logo.svg"
                                    alt="StraySpot Logo"
                                    width={150}
                                    height={80}
                                    priority
                                    className="h-auto w-auto"
                                />
                            </div>

                            {/* Description with proper spacing */}
                            <p className="text-gray-600 mb-6 max-w-sm text-center md:text-left">
                                Connecting pets in need with loving homes. Our mission is to help every
                                stray find their forever family.
                            </p>

                            <div className="text-gray-500 text-sm">
                                © {new Date().getFullYear()} StraySpot. All rights reserved.
                            </div>
                        </div>
                    </div>

                    {/* Quick Links - Enhanced mobile layout */}
                    <div className="mt-8 md:mt-0">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b border-amber-200 pb-2">Company</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1">
                                    <motion.span
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                    >
                                        About us
                                    </motion.span>
                                </Link>
                            </li>
                            <li>
                                <Link href="#blog" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1">
                                    <motion.span
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                    >
                                        Blog
                                    </motion.span>
                                </Link>
                            </li>
                            <li>
                                <Link href="#privacy" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1">
                                    <motion.span
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                    >
                                        Privacy Policy
                                    </motion.span>
                                </Link>
                            </li>
                            <li>
                                <Link href="#terms" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1">
                                    <motion.span
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                    >
                                        Terms of Service
                                    </motion.span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For You - Enhanced mobile layout */}
                    <div className="mt-8 md:mt-0">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b border-amber-200 pb-2">For You</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/browse/pets" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1">
                                    <motion.span
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                    >
                                        Find a Pet
                                    </motion.span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse/shelters" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1">
                                    <motion.span
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                    >
                                        Shelters
                                    </motion.span>
                                </Link>
                            </li>
                            <li>
                                <Link href="#resources" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1">
                                    <motion.span
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                    >
                                        Resources
                                    </motion.span>
                                </Link>
                            </li>
                            <li>
                                <Link href="#success-stories" className="text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1">
                                    <motion.span
                                        whileHover={{ x: 4 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                    >
                                        Success Stories
                                    </motion.span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Section - Enhanced for mobile */}
                    <div className="mt-8 md:mt-0">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b border-amber-200 pb-2">Contact</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="mailto:hello@strayspot.com" className="text-gray-600 hover:text-orange-500 transition-colors">
                                    hello@strayspot.com
                                </a>
                            </li>
                            <li>
                                <a href="tel:+1234567890" className="text-gray-600 hover:text-orange-500 transition-colors">
                                    (123) 456-7890
                                </a>
                            </li>
                            <li className="pt-4">
                                <div className="flex gap-4">
                                    <motion.a
                                        href="https://facebook.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.2 }}
                                        className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                                    >
                                        <Facebook size={18} />
                                    </motion.a>
                                    <motion.a
                                        href="https://instagram.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.2 }}
                                        className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                                    >
                                        <Instagram size={18} />
                                    </motion.a>
                                    <motion.a
                                        href="https://twitter.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.2 }}
                                        className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                                    >
                                        <Twitter size={18} />
                                    </motion.a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom section - Enhanced mobile layout */}
                <div className="mt-12 pt-6 border-t border-amber-200/50">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-sm text-gray-500 mb-6 md:mb-0">
                            Made with ❤️ for all furry friends
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
                            <Link href="#accessibility" className="hover:text-orange-500 transition-colors">Accessibility</Link>
                            <Link href="#sitemap" className="hover:text-orange-500 transition-colors">Sitemap</Link>
                            <Link href="#help" className="hover:text-orange-500 transition-colors">Help</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}