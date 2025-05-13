"use client";
import { motion } from 'framer-motion';

export default function HowStraySpotWorksSection() {
    return (
        <>
            {/* How It Works Section - Enhanced with motion */}
            <section className="py-20 relative overflow-hidden  ">
                {/* Animated paw background */}
                <div className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: "url('/paws-bg.svg')",
                        backgroundSize: "800px",
                        backgroundRepeat: "repeat",
                        opacity: 0.15
                    }}>
                </div>

                {/* Overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/50"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-3 text-gray-800">How StraySpot Works</h2>
                        <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">Our simple process to help pets find loving homes.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                        {/* Step 1 */}
                        <motion.div
                            className="text-center relative"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                        >
                            <motion.div
                                className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 relative"
                                whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(45, 212, 191, 0.3)" }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <motion.span
                                    className="text-teal-600 text-3xl font-bold"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >1</motion.span>
                                {/* Decorative paw */}
                                <motion.div
                                    className="absolute -right-2 -top-2 text-teal-200 text-2xl"
                                    initial={{ rotate: -15 }}
                                    animate={{ rotate: [0, -15, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                                >
                                    🐾
                                </motion.div>
                            </motion.div>
                            <h3 className="text-xl font-semibold mb-3">Browse Pets</h3>
                            <p className="text-gray-600">Search through our database of pets from various shelters and rescue organizations.</p>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                            className="text-center relative"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            <motion.div
                                className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 relative"
                                whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.3)" }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <motion.span
                                    className="text-orange-600 text-3xl font-bold"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >2</motion.span>
                                {/* Decorative paw */}
                                <motion.div
                                    className="absolute -right-2 -bottom-2 text-orange-200 text-2xl"
                                    initial={{ rotate: -15 }}
                                    animate={{ rotate: [0, -15, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                                >
                                    🐾
                                </motion.div>
                            </motion.div>
                            <h3 className="text-xl font-semibold mb-3">Apply to Adopt</h3>
                            <p className="text-gray-600">Complete an adoption application for the pet that steals your heart.</p>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                            className="text-center relative"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            <motion.div
                                className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 relative"
                                whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(236, 72, 153, 0.3)" }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <motion.span
                                    className="text-pink-600 text-3xl font-bold"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >3</motion.span>
                                {/* Decorative paw */}
                                <motion.div
                                    className="absolute -right-2 -top-2 text-pink-200 text-2xl"
                                    initial={{ rotate: -15 }}
                                    animate={{ rotate: [0, -15, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                                >
                                    🐾
                                </motion.div>
                            </motion.div>
                            <h3 className="text-xl font-semibold mb-3">Welcome Home</h3>
                            <p className="text-gray-600">Get approved, meet your new pet, and welcome them to their forever home.</p>
                        </motion.div>


                    </div>

                    {/* Connecting lines between steps (visible on md screens and up) */}
                    <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gray-200 -translate-y-16 z-0"></div>
                </div>
            </section>
        </>

    );
}