"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function WaysToHelpSection() {
    return (
        <section className="py-16 bg-gradient-to-b from-amber-50 to-white">
            <div className='container mx-auto px-4 text-center'>
                <motion.h2
                    className="text-3xl font-bold text-center mb-3 text-gray-800"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    Ways to Help
                </motion.h2>
                <motion.p
                    className="text-gray-600 text-center mb-10 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    There are many ways to make a difference in the lives of animals in need.
                </motion.p>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    {/* Adopt Card */}
                    <motion.div
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform-gpu"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        whileHover={{
                            y: -5,
                            transition: { duration: 0.3 }
                        }}
                    >
                        <div className="h-48 relative overflow-hidden">
                            <Image
                                src="/adopt.jpg"
                                alt="Adopt a pet"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-t from-orange-600/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end"
                                whileHover={{ opacity: 1 }}
                            >
                                <div className="p-4 text-white">
                                    <p className="font-semibold">Give a pet a loving home</p>
                                </div>
                            </motion.div>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                                    <span className="text-orange-600">❤️</span>
                                </div>
                                <h3 className="text-xl font-semibold text-orange-600">Adopt</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Give a homeless pet a second chance by providing them with a loving forever home.</p>
                            <Link href="/browse/pets" className="mt-2 inline-flex items-center text-orange-500 hover:text-orange-600 font-medium group">
                                <span>Find a Pet</span>
                                <motion.span
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.5 }}
                                    className="ml-1"
                                >
                                    →
                                </motion.span>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Volunteer Card */}
                    <motion.div
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform-gpu"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        whileHover={{
                            y: -5,
                            transition: { duration: 0.3 }
                        }}
                    >
                        <div className="h-48 relative overflow-hidden">
                            <Image
                                src="/volunteer.jpg"
                                alt="Volunteer"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-t from-teal-600/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end"
                                whileHover={{ opacity: 1 }}
                            >
                                <div className="p-4 text-white">
                                    <p className="font-semibold">Help shelters in your area</p>
                                </div>
                            </motion.div>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                                    <span className="text-teal-600">🤝</span>
                                </div>
                                <h3 className="text-xl font-semibold text-teal-600">Volunteer</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Shelters always need helping hands. Donate your time and skills to help animals in need.</p>
                            <Link href="/browse/shelters" className="mt-2 inline-flex items-center text-teal-500 hover:text-teal-600 font-medium group">
                                <span>Find Shelters</span>
                                <motion.span
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.7 }}
                                    className="ml-1"
                                >
                                    →
                                </motion.span>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Donate Card */}
                    <motion.div
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform-gpu"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        whileHover={{
                            y: -5,
                            transition: { duration: 0.3 }
                        }}
                    >
                        <div className="h-48 relative overflow-hidden">
                            <Image
                                src="/donate.jpg"
                                alt="Donate"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-t from-blue-600/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end"
                                whileHover={{ opacity: 1 }}
                            >
                                <div className="p-4 text-white">
                                    <p className="font-semibold">Support animal welfare efforts</p>
                                </div>
                            </motion.div>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    <span className="text-blue-600">💙</span>
                                </div>
                                <h3 className="text-xl font-semibold text-blue-600">Donate</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Financial contributions help shelters provide food, medical care, and housing to animals.</p>
                            <Link href="/browse/shelters" className="mt-2 inline-flex items-center text-blue-500 hover:text-blue-600 font-medium group">
                                <span>Support Shelters</span>
                                <motion.span
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.9 }}
                                    className="ml-1"
                                >
                                    →
                                </motion.span>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Spread the Word Card */}
                    <motion.div
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform-gpu"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        whileHover={{
                            y: -5,
                            transition: { duration: 0.3 }
                        }}
                    >
                        <div className="h-48 relative overflow-hidden">
                            <Image
                                src="/spread-word.jpg"
                                alt="Spread the word"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-t from-pink-600/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end"
                                whileHover={{ opacity: 1 }}
                            >
                                <div className="p-4 text-white">
                                    <p className="font-semibold">Help pets get noticed</p>
                                </div>
                            </motion.div>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                                    <span className="text-pink-600">📣</span>
                                </div>
                                <h3 className="text-xl font-semibold text-pink-600">Spread the Word</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Share adoptable pets on social media to help them find their forever homes faster.</p>
                            <Link href="/browse/pets" className="mt-2 inline-flex items-center text-pink-500 hover:text-pink-600 font-medium group">
                                <span>Start Sharing</span>
                                <motion.span
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1.1 }}
                                    className="ml-1"
                                >
                                    →
                                </motion.span>
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Optional Call to Action */}
                <motion.div
                    className="mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                >
                    <Link
                        href="/browse/pets"
                        className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                    >
                        Get Started
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 ml-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}