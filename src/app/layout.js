import { Readex_Pro, Fredoka } from "next/font/google";
import { AuthProvider } from '../../context/AuthContext';
import { AdminAuthProvider } from '../../context/AdminAuthContext';
import { FavoritesProvider } from '../../context/FavoritesContext';
import { SpeedInsights } from "@vercel/speed-insights/next"
import Navbar from '../components/Navbar';
import FavoritesDebug from '../../components/debug/FavoritesDebug'; // Add this import
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
        className={`${readexPro.variable} ${fredoka.variable} antialiased bg-amber-50`}
      >
        <AuthProvider>
          <AdminAuthProvider>
            <FavoritesProvider>
              <Navbar />
              <div className="h-24 "></div>
              {children}
              {process.env.NODE_ENV !== 'production' && <FavoritesDebug />}
              <SpeedInsights />
            </FavoritesProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}