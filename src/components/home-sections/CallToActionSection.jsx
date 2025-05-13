"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CallToActionSection() {
    // Set up state for paw positions
    const [pawPositions, setPawPositions] = useState([]);

    // Generate random positions only on client side after hydration
    useEffect(() => {
        const positions = Array(6).fill(0).map(() => ({
            x: Math.random() * 100 - 50 + "%",
            rotate: Math.random() * 40 - 20,
            opacity: 0.3 + Math.random() * 0.4,
            duration: 10 + Math.random() * 10
        }));
        setPawPositions(positions);
    }, []);

    return (
        <section className="py-20 bg-gradient-to-r from-orange-500 to-amber-500 text-white relative overflow-hidden">
            {/* Decorative dog and cat silhouettes */}
            <motion.div
                className="absolute left-0 bottom-0 w-40 h-40 opacity-10"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            >
                <Image
                    src="/dog-silhouette.png"
                    alt="Dog silhouette"
                    width={160}
                    height={160}
                />
            </motion.div>

            <motion.div
                className="absolute right-0 bottom-0 w-40 h-40 opacity-10"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            >
                <Image
                    src="/cat-silhouette.png"
                    alt="Cat silhouette"
                    width={160}
                    height={160}
                />
            </motion.div>

            <div className="container mx-auto px-4 text-center relative z-10">
                <motion.h2
                    className="text-3xl md:text-5xl font-bold mb-6"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    Ready to Find Your New Best Friend?
                </motion.h2>

                <motion.p
                    className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-90"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                >
                    Join thousands of happy pet owners who found their perfect companions through StraySpot.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row justify-center gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Link href="/browse/pets" className="block bg-white text-orange-600 hover:bg-gray-100 font-semibold py-3 px-10 rounded-lg transition-colors duration-200">
                            Browse Pets
                        </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Link href="/register" className="block bg-transparent hover:bg-white/10 text-white border-2 border-white font-semibold py-3 px-10 rounded-lg transition-colors duration-200">
                            Register Now
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Paw prints animation */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    {pawPositions.map((position, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-white/10 text-2xl"
                            initial={{
                                x: position.x,
                                y: -50,
                                rotate: position.rotate,
                                opacity: position.opacity
                            }}
                            animate={{ y: "120%" }}
                            transition={{
                                duration: position.duration,
                                repeat: Infinity,
                                delay: i * 2,
                                ease: "linear"
                            }}
                        >
                            🐾
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}