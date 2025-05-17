"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
    const buttonVariants = {
        hover: {
            scale: 1.05,
            transition: { duration: 0.2 }
        },
        tap: {
            scale: 0.98,
            transition: { duration: 0.1 }
        }
    };

    return (
        <>
            <section className="relative min-h-[85vh] flex items-center overflow-hidden"
                style={{
                    backgroundImage: "url('/paws-bg.svg')",
                    backgroundSize: "800px",
                    backgroundRepeat: "repeat",
                    opacity: 1,
                }}>
                {/* Animated gradient overlay */}
                <div
                    className="absolute inset-0 bg-gradient-to-b from-amber-50/70 to-white/80 z-0"
                ></div>

                {/* Animated decorative elements */}
                <motion.div
                    className="absolute top-[15%] right-[10%] text-6xl text-amber-200 opacity-30"
                    animate={{
                        y: [0, -15, 0],
                        rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
                >
                    🐾
                </motion.div>
                <motion.div
                    className="absolute bottom-[15%] left-[10%] text-7xl text-amber-200 opacity-30"
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, -5, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                >
                    🐾
                </motion.div>

                <div className="container mx-auto w-full max-w-7xl px-4 py-12 relative z-10">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-8 md:mb-0">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <motion.h1
                                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-800"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7 }}
                                >
                                    Find Your{" "}
                                    <motion.span
                                        className="text-orange-500 inline-block"
                                        animate={{
                                            color: ["#f97316", "#fb923c", "#f97316"]
                                        }}
                                        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                                    >
                                        Furever
                                    </motion.span>{" "}
                                    Friend
                                </motion.h1>

                                <motion.p
                                    className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.3 }}
                                >
                                    Connect with local shelters and rescue organizations to adopt, foster, or help pets in need.
                                </motion.p>

                                <motion.div
                                    className="flex flex-col sm:flex-row gap-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.6 }}
                                >
                                    <motion.div
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <Link
                                            href="/browse/pets"
                                            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center group shadow-md"
                                        >
                                            <span>Browse Adoptable Pets</span>
                                            <motion.div
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.5 }}
                                                className="ml-2"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </motion.div>
                                        </Link>
                                    </motion.div>

                                    <motion.div
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <Link
                                            href="/browse/shelters"
                                            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-md"
                                        >
                                            <span>Find Shelters</span>
                                        </Link>
                                    </motion.div>
                                </motion.div>

                                {/* Animated badges below buttons */}
                                <motion.div
                                    className="flex items-center gap-4 mt-10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2, duration: 1 }}
                                >
                                    <div className="flex items-center text-sm text-gray-600">
                                        <div className="bg-amber-100 p-1.5 rounded-full mr-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span>Trusted Shelters</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <div className="bg-amber-100 p-1.5 rounded-full mr-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <span>Safe Adoption</span>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>

                        <motion.div
                            className="md:w-1/2 relative"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.3 }}
                        >
                            {/* Main pet image */}
                            <motion.div
                                className="rounded-2xl overflow-hidden shadow-xl border-4 border-white relative w-full aspect-square max-w-md mx-auto"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
                            >
                                <Image
                                    src="/hero1.jpg"
                                    alt="Happy adopted pet"
                                    width={500}
                                    height={500}
                                    className="object-cover w-full h-full"
                                    priority
                                />

                            </motion.div>

                            {/* Floating smaller images with independent animations */}
                            <motion.div
                                className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full border-2 border-white shadow-lg overflow-hidden hidden md:block"
                                animate={{
                                    y: [0, -12, 0],
                                    x: [0, 5, 0],
                                    rotate: [0, -5, 0]
                                }}
                                transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                            >
                                <Image
                                    src="/hero2.jpg"
                                    alt="Cat"
                                    width={100}
                                    height={100}
                                    className="object-cover w-full h-full"
                                />
                            </motion.div>

                            <motion.div
                                className="absolute -top-4 -right-4 w-32 h-32 rounded-full border-2 border-white shadow-lg overflow-hidden hidden md:block"
                                animate={{
                                    y: [0, 12, 0],
                                    x: [0, -5, 0],
                                    rotate: [0, 5, 0]
                                }}
                                transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
                            >
                                <Image
                                    src="/hero3.jpg"
                                    alt="Dog"
                                    width={150}
                                    height={150}
                                    className="object-cover w-full h-full"
                                />
                            </motion.div>

                            {/* New floating element */}
                            <motion.div
                                className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-lg p-3 shadow-lg hidden md:flex items-center space-x-2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    y: [0, -10, 0]
                                }}
                                transition={{
                                    opacity: { delay: 1.8, duration: 0.5 },
                                    y: { delay: 2, duration: 5, repeat: Infinity, repeatType: "reverse" }
                                }}
                            >
                                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                    <span className="text-amber-600 text-lg">❤️</span>
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium text-gray-800">1,250+</p>
                                    <p className="text-xs text-gray-500">Adoptions</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </>
    )
}