import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
    title: "GencKalculator",
    description: "Kişiselleştirilmiş Beslenme Planlayıcısı",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
            <body className="bg-gradient-to-br from-white to-slate-50 text-slate-900 min-h-screen font-sans antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
