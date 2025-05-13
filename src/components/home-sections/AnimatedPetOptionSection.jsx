"use client"

import { motion } from "framer-motion";
import Link from 'next/link';

const AnimatedPetOption = ({ href, emoji, label, delay }) => (
    <Link href={href} className="bg-white hover:bg-orange-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center group relative overflow-hidden">
        <motion.div
            className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-all z-10"
            whileHover={{
                scale: 1.1,
                rotate: [0, -5, 5, -5, 0],
                transition: { duration: 0.5 }
            }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: delay * 0.1 + 0.2 }}
        >
            <span className="text-3xl">{emoji}</span>
        </motion.div>

        <motion.span
            className="font-medium text-gray-700"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: delay * 0.1 + 0.3 }}
        >
            {label}
        </motion.span>

        {/* Decorative paw prints that appear on hover */}
        <motion.div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
        >
            <div className="absolute top-1/4 left-2 text-orange-200 text-xs">🐾</div>
            <div className="absolute bottom-1/3 right-3 text-orange-200 text-sm">🐾</div>
            <div className="absolute top-2/3 left-1/4 text-orange-200 text-xs">🐾</div>
        </motion.div>
    </Link>
);

export default function AnimatedSection() {
    return (
        <section className="py-16 bg-white relative overflow-hidden">
            {/* Decorative elements */}
            <motion.div
                className="absolute -top-12 -left-12 text-7xl text-amber-100 opacity-50 rotate-12"
                animate={{
                    rotate: [12, 0, 12],
                    y: [0, -10, 0]
                }}
                transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
            >
                🐾
            </motion.div>
            <motion.div
                className="absolute bottom-8 -right-12 text-7xl text-amber-100 opacity-50 -rotate-12"
                animate={{
                    rotate: [-12, 0, -12],
                    y: [0, -10, 0]
                }}
                transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            >
                🐾
            </motion.div>

            <div className="container mx-auto px-4">
                <motion.div
                    className="max-w-4xl mx-auto bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl shadow-lg relative overflow-hidden"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        className="absolute -right-10 -top-10 text-9xl text-amber-100 opacity-30"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    >
                        🐾
                    </motion.div>

                    <motion.h2
                        className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800 relative"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Find Your Perfect Companion
                        <div className="h-1 w-20 bg-orange-400 mx-auto mt-3 rounded-full"></div>
                    </motion.h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <AnimatedPetOption href="/browse/pets?specie=dog" emoji="🐕" label="Dogs" delay={1} />
                        <AnimatedPetOption href="/browse/pets?specie=cat" emoji="🐈" label="Cats" delay={2} />
                        <AnimatedPetOption href="/browse/shelters" emoji="🏠" label="Shelters" delay={3} />
                        <AnimatedPetOption href="/browse/pets" emoji="🔍" label="All Pets" delay={4} />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}