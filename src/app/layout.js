import { Readex_Pro, Fredoka } from "next/font/google";
import { AuthProvider } from '../../context/AuthContext';
import { AdminAuthProvider } from '../../context/AdminAuthContext';
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
  title: 'StraySafe',
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
          </AdminAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}