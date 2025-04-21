"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, loading, isAuthenticated, login } = useAuth();
    const router = useRouter();

    // If already authenticated, redirect to home page
    useEffect(() => {
        if (!loading && isAuthenticated) {
            console.log("Already authenticated in login page, redirecting to home");
            router.push('/');
        }
    }, [user, loading, isAuthenticated, router]);

    const handleDismissError = () => {
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            // Use the login function from AuthContext
            const result = await login(email, password);

            if (result.success) {
                // Redirect to home page after successful login
                router.push('/');
            } else {
                setError(result.error || "Login failed");
                setPassword("");
            }
        } catch (error) {
            setError("An unexpected error occurred");
            setPassword("");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <h1 className="font-extrabold">Login</h1>
            <form onSubmit={handleSubmit} className="bg-blue-200 w-3xl mx-auto border-2 border-blue-500 p-4">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={handleDismissError}
                            className="text-red-700 hover:text-red-900 font-bold"
                            aria-label="Dismiss error"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="px-4 gap-5">
                    <label htmlFor="email" className="">Email</label>
                    <input
                        className="border border-blue-900"
                        type="email"
                        id="email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="px-4 gap-5">
                    <label htmlFor="password" className="">Password</label>
                    <input
                        className="border border-blue-900"
                        type="password"
                        id="password"
                        value={password}
                        required
                        placeholder="********"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button 
                    type="submit"
                    disabled={isSubmitting} 
                    className="bg-green-600 p-3 rounded-3xl disabled:bg-green-400"
                >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </>
    );
}