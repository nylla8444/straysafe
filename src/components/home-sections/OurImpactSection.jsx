"use client";
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

// Component for animating the number count-up effect
const AnimatedCounter = ({ targetValue, duration = 2, prefix = "", suffix = "" }) => {
    const [count, setCount] = useState(0);
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.3,
    });

    useEffect(() => {
        let startTime;
        let animationFrame;

        if (inView) {
            const startValue = 0;
            const step = timestamp => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
                const currentCount = Math.floor(progress * (targetValue - startValue) + startValue);

                setCount(currentCount);

                if (progress < 1) {
                    animationFrame = requestAnimationFrame(step);
                }
            };

            animationFrame = requestAnimationFrame(step);
        }

        return () => cancelAnimationFrame(animationFrame);
    }, [inView, targetValue, duration]);

    return <div ref={ref}>{prefix}{count}{suffix}</div>;
};

export default function OurImpactSection() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const controls = useAnimation();

    useEffect(() => {
        if (inView) {
            controls.start("visible");
        }
    }, [controls, inView]);

    return (
        <>
            <section className="py-16 relative" ref={ref}>
                {/* Paw background */}
                <div className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: "url('/paws-bg.svg')",
                        backgroundSize: "800px",
                        backgroundRepeat: "repeat",
                        opacity: 0.15
                    }}>
                </div>

                <div className="container mx-auto w-full max-w-7xl px-4 relative z-10">
                    <motion.h2
                        className="text-3xl font-bold text-center mb-16 text-gray-800"
                        initial={{ opacity: 0, y: -20 }}
                        animate={controls}
                        variants={{
                            visible: { opacity: 1, y: 0 },
                            hidden: { opacity: 0, y: -20 }
                        }}
                        transition={{ duration: 0.7 }}
                    >
                        Our Impact
                    </motion.h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={controls}
                            variants={{
                                visible: { opacity: 1, y: 0 },
                                hidden: { opacity: 0, y: 20 }
                            }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                        >
                            <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
                                <AnimatedCounter targetValue={1250} suffix="+" />
                            </div>
                            <p className="text-gray-600">Pets Adopted</p>

                            <motion.div
                                className="w-16 h-1 bg-orange-300 mx-auto mt-4"
                                initial={{ width: 0 }}
                                animate={controls}
                                variants={{
                                    visible: { width: "4rem" },
                                    hidden: { width: 0 }
                                }}
                                transition={{ duration: 1, delay: 1.2 }}
                            />
                        </motion.div>

                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={controls}
                            variants={{
                                visible: { opacity: 1, y: 0 },
                                hidden: { opacity: 0, y: 20 }
                            }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                        >
                            <div className="text-4xl md:text-5xl font-bold text-teal-500 mb-2">
                                <AnimatedCounter targetValue={85} suffix="+" />
                            </div>
                            <p className="text-gray-600">Partner Shelters</p>

                            <motion.div
                                className="w-16 h-1 bg-teal-300 mx-auto mt-4"
                                initial={{ width: 0 }}
                                animate={controls}
                                variants={{
                                    visible: { width: "4rem" },
                                    hidden: { width: 0 }
                                }}
                                transition={{ duration: 1, delay: 1.4 }}
                            />
                        </motion.div>

                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={controls}
                            variants={{
                                visible: { opacity: 1, y: 0 },
                                hidden: { opacity: 0, y: 20 }
                            }}
                            transition={{ duration: 0.7, delay: 0.5 }}
                        >
                            <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2">
                                <AnimatedCounter targetValue={750} prefix="₱" suffix="K+" />
                            </div>
                            <p className="text-gray-600">Donations Raised</p>

                            <motion.div
                                className="w-16 h-1 bg-pink-300 mx-auto mt-4"
                                initial={{ width: 0 }}
                                animate={controls}
                                variants={{
                                    visible: { width: "4rem" },
                                    hidden: { width: 0 }
                                }}
                                transition={{ duration: 1, delay: 1.6 }}
                            />
                        </motion.div>

                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={controls}
                            variants={{
                                visible: { opacity: 1, y: 0 },
                                hidden: { opacity: 0, y: 20 }
                            }}
                            transition={{ duration: 0.7, delay: 0.7 }}
                        >
                            <div className="text-4xl md:text-5xl font-bold text-teal-500 mb-2">
                                <AnimatedCounter targetValue={5} suffix="K+" />
                            </div>
                            <p className="text-gray-600">Active Users</p>

                            <motion.div
                                className="w-16 h-1 bg-teal-300 mx-auto mt-4"
                                initial={{ width: 0 }}
                                animate={controls}
                                variants={{
                                    visible: { width: "4rem" },
                                    hidden: { width: 0 }
                                }}
                                transition={{ duration: 1, delay: 1.8 }}
                            />
                        </motion.div>
                    </div>

                    {/* Optional decorative elements */}
                    <motion.div
                        className="absolute -bottom-8 left-[15%] text-5xl text-orange-200 opacity-20 hidden lg:block"
                        initial={{ opacity: 0, y: 20 }}
                        animate={controls}
                        variants={{
                            visible: {
                                opacity: 0.2,
                                y: [0, -15, 0],
                                rotate: [0, 10, 0]
                            },
                            hidden: { opacity: 0, y: 20 }
                        }}
                        transition={{
                            opacity: { duration: 1, delay: 2 },
                            y: { duration: 5, repeat: Infinity, repeatType: "reverse" },
                            rotate: { duration: 8, repeat: Infinity, repeatType: "reverse" }
                        }}
                    >
                        🐾
                    </motion.div>

                    <motion.div
                        className="absolute -top-8 right-[15%] text-5xl text-teal-200 opacity-20 hidden lg:block"
                        initial={{ opacity: 0, y: -20 }}
                        animate={controls}
                        variants={{
                            visible: {
                                opacity: 0.2,
                                y: [0, -20, 0],
                                rotate: [0, -10, 0]
                            },
                            hidden: { opacity: 0, y: -20 }
                        }}
                        transition={{
                            opacity: { duration: 1, delay: 2 },
                            y: { duration: 6, repeat: Infinity, repeatType: "reverse" },
                            rotate: { duration: 9, repeat: Infinity, repeatType: "reverse" }
                        }}
                    >
                        🐾
                    </motion.div>
                </div>
            </section>
        </>
    )
}