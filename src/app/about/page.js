"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowRight, Shield, BarChart, Users, MessageCircle, Clock,
    PawPrint, Search, Heart, ClipboardCheck, CreditCard, Building, Ambulance
} from 'lucide-react';
import Footer from '../../components/Footer';

export default function AboutPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-amber-50 to-white py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10 z-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-5xl"
                            initial={{
                                top: `${15 + i * 10}%`,
                                left: `${10 + i * 10}%`,
                                opacity: 0.3 + (i * 0.1)
                            }}
                            animate={{
                                y: [0, -15, 0],
                                rotate: [0, i % 2 === 0 ? 10 : -10, 0]
                            }}
                            transition={{
                                duration: 5 + i,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                        >
                            🐾
                        </motion.div>
                    ))}
                </div>

                <div className="container mx-auto w-full max-w-7xl px-4 relative z-10">
                    <motion.div
                        className="text-center max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            About <span className="text-orange-500">Stray</span><span className='text-teal-500'>Spot</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Ensuring safety and care for rescued animals through technology
                        </p>
                        <div className="flex justify-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    href="/browse/pets"
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg inline-flex items-center transition-colors duration-200"
                                >
                                    Find a Pet
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    href="/browse/shelters"
                                    className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-3 rounded-lg inline-flex items-center transition-colors duration-200"
                                >
                                    Browse Shelters
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-10 sm:py-12 md:py-16 bg-white">
                <div className="container mx-auto w-full max-w-7xl px-4">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <motion.div
                            className="md:w-1/2"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Our Mission</h2>
                            <p className="text-lg text-gray-600 mb-6">
                                StraySpot is a web-based application designed to support the efficient management and adoption of stray animals. We connect adoption centers with potential pet adopters through streamlined services.
                            </p>
                            <p className="text-lg text-gray-600 mb-6">
                                By reducing manual workloads and improving communication, StraySpot enhances adoption rates and promotes a more organized, compassionate approach to animal welfare.
                            </p>
                            <div className="flex items-center text-orange-500 font-semibold">
                                <Shield className="mr-2 h-6 w-6" />
                                <span>Ensuring safety and care for all animals</span>
                            </div>
                        </motion.div>
                        <motion.div
                            className="w-full md:w-1/2"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <div className="relative w-full aspect-square sm:aspect-video md:aspect-auto md:h-80 rounded-xl overflow-hidden shadow-xl">
                                <Image
                                    src="/mission-image.jpg"
                                    alt="Rescued pets at shelter"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                                    <div className="p-4 sm:p-6 text-white">
                                        <p className="text-lg sm:text-xl font-semibold">Every pet deserves a loving home</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Why We Exist Section */}
            <section className="py-16 bg-amber-50">
                <div className="container mx-auto w-full max-w-7xl px-4">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Why We Exist</h2>
                        <p className="text-lg text-gray-600">
                            StraySpot was developed in response to the growing call for digital transformation in animal welfare, addressing inefficiencies faced by shelters that still rely on manual systems.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Streamlined Management",
                                description: "Replacing spreadsheets and informal tracking practices that often lead to data loss and mismanagement.",
                                icon: <BarChart className="h-10 w-10 text-orange-500" />,
                                delay: 0.1
                            },
                            {
                                title: "Enhanced Communication",
                                description: "Improving communication between shelters, potential adopters, and the community to increase adoption rates.",
                                icon: <MessageCircle className="h-10 w-10 text-teal-500" />,
                                delay: 0.3
                            },
                            {
                                title: "Supporting Transparency",
                                description: "Making it especially beneficial for resource-limited shelters in areas like Iloilo City.",
                                icon: <Users className="h-10 w-10 text-blue-500" />,
                                delay: 0.5
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className="bg-white p-8 rounded-xl shadow-md"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: item.delay }}
                            >
                                <div className="mb-6">{item.icon}</div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-800">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section with Enhanced Animations */}
            <section className="py-10 sm:py-12 md:py-16 bg-white">
                <div className="container mx-auto w-full max-w-7xl px-4">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Key Features</h2>
                        <p className="text-lg text-gray-600">
                            StraySpot provides a comprehensive suite of tools for animal shelters and potential adopters.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[
                            {
                                title: "Multi-User Profiles",
                                description: "Customizable profiles for both adopters and animal welfare organizations",
                                color: "bg-amber-100 text-amber-600",
                                hoverColor: "bg-amber-200",
                                icon: <Users className="h-6 w-6" />,
                                delay: 0.1
                            },
                            {
                                title: "Pet Management",
                                description: "Create detailed pet profiles with multiple images, tags, and characteristics",
                                color: "bg-orange-100 text-orange-600",
                                hoverColor: "bg-orange-200",
                                icon: <PawPrint className="h-6 w-6" />,
                                delay: 0.2
                            },
                            {
                                title: "Advanced Search",
                                description: "Find pets using filters for species, breed, gender, age, and adoption fee",
                                color: "bg-blue-100 text-blue-600",
                                hoverColor: "bg-blue-200",
                                icon: <Search className="h-6 w-6" />,
                                delay: 0.3
                            },
                            {
                                title: "Favorites System",
                                description: "Save and manage your favorite pets across browsing sessions",
                                color: "bg-rose-100 text-rose-600",
                                hoverColor: "bg-rose-200",
                                icon: <Heart className="h-6 w-6" />,
                                delay: 0.4
                            },
                            {
                                title: "Adoption Process",
                                description: "Streamlined adoption applications with reference collection and status tracking",
                                color: "bg-purple-100 text-purple-600",
                                hoverColor: "bg-purple-200",
                                icon: <ClipboardCheck className="h-6 w-6" />,
                                delay: 0.5
                            },
                            {
                                title: "Payment Processing",
                                description: "Secure handling of adoption fees with verification system",
                                color: "bg-emerald-100 text-emerald-600",
                                hoverColor: "bg-emerald-200",
                                icon: <CreditCard className="h-6 w-6" />,
                                delay: 0.6
                            },
                            {
                                title: "Organization Tools",
                                description: "Dashboard for shelters to manage pets, applications and rescue operations",
                                color: "bg-teal-100 text-teal-600",
                                hoverColor: "bg-teal-200",
                                icon: <Building className="h-6 w-6" />,
                                delay: 0.7
                            },
                            {
                                title: "Rescue Tracking",
                                description: "Monitor ongoing and completed animal rescue operations with statistics",
                                color: "bg-red-100 text-red-600",
                                hoverColor: "bg-red-200",
                                icon: <Ambulance className="h-6 w-6" />,
                                delay: 0.8
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                className="rounded-lg p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: 0.05 * i }}
                                whileHover={{
                                    y: -5,
                                    scale: 1.02,
                                    transition: { type: "spring", stiffness: 500, damping: 15 }
                                }}
                                whileTap={{ scale: 0.98 }} // Add this for touch feedback
                            >
                                {/* Decorative background element */}
                                <div
                                    className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-20 transition-all duration-300 ease-in-out group-hover:scale-150 ${feature.color}`}
                                ></div>

                                {/* Feature icon with animation */}
                                <motion.div
                                    className={`relative w-14 h-14 rounded-full ${feature.color} flex items-center justify-center mb-4 z-10 transition-all duration-300 group-hover:${feature.hoverColor}`}
                                    whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.3 } }}
                                >
                                    {feature.icon || <Clock className="h-7 w-7" />}
                                </motion.div>

                                {/* Feature content */}
                                <h3 className="text-xl font-semibold mb-2 text-gray-800 relative z-10">{feature.title}</h3>
                                <p className="text-gray-600 relative z-10">{feature.description}</p>

                                {/* Animated border effect on hover */}
                                <motion.div
                                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500"
                                    initial={{ width: "0%" }}
                                    whileHover={{ width: "100%", transition: { duration: 0.2 } }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision/Growth Section */}
            <section className="py-16 bg-gradient-to-b from-orange-500 to-amber-500 text-white">
                <div className="container mx-auto w-full max-w-7xl px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.h2
                            className="text-3xl font-bold mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            Our Vision For Growth
                        </motion.h2>
                        <motion.p
                            className="text-lg mb-8 opacity-90"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 0.9 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            Despite challenges, strategic partnerships with government agencies, NGOs, and donor networks present opportunities for sustainable growth. StraySpot is committed to strengthening its role in the local animal welfare ecosystem by focusing on secure, user-friendly design and continuous adaptation to shelter needs.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                        >
                            <Link
                                href="#contact"
                                className="bg-white text-orange-500 hover:bg-orange-50 font-semibold px-6 py-3 rounded-lg inline-flex items-center transition-colors duration-200"
                            >
                                Partner With Us
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 bg-white">
                <div className="container mx-auto w-full max-w-7xl px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.h2
                            className="text-3xl md:text-4xl font-bold mb-6 text-gray-800"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            Ready to make a difference?
                        </motion.h2>
                        <motion.p
                            className="text-xl text-gray-600 mb-10"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            Join the StraySpot community and help us connect more animals with loving homes.
                        </motion.p>
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                        >
                            <Link
                                href="/register"
                                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 sm:px-8 py-4 sm:py-3 rounded-lg transition-colors duration-200 text-center"
                            >
                                Create Account
                            </Link>
                            <Link
                                href="/browse/pets"
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 sm:px-8 py-4 sm:py-3 rounded-lg transition-colors duration-200 text-center"
                            >
                                Browse Adoptable Pets
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}