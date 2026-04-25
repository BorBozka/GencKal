import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "GencKal",
    description: "Kişiselleştirilmiş Beslenme Planlayıcısı",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr" className={inter.variable}>
            <body className="bg-gradient-to-br from-white to-slate-50 text-slate-900 min-h-screen font-sans antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
