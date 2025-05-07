import { Readex_Pro, Fredoka } from "next/font/google";
import { AuthProvider } from '../../context/AuthContext';
import { AdminAuthProvider } from '../../context/AdminAuthContext';
import { SpeedInsights } from "@vercel/speed-insights/next"
import Navbar from '../components/Navbar';
import "./globals.css";



const readexPro = Readex_Pro({
  variable: "--font-readex-pro",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata = {
  title: 'StraySpot',
  description: 'Finding homes for stray animals',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${readexPro.variable} ${fredoka.variable} antialiased`}
      >
        <AuthProvider>
          <AdminAuthProvider>
            <Navbar />
            {children}
            <SpeedInsights />
          </AdminAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}