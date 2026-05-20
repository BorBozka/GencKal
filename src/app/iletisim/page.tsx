"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

export default function ContactPage() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col">
            {/* Header */}
            <header className={`sticky top-0 z-50 w-full flex justify-between items-center px-8 md:px-16 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'}`}>
                <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-indigo-700">
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-4 bg-indigo-700 rounded-full"></div>
                        <div className="w-1.5 h-6 bg-indigo-700 rounded-full"></div>
                        <div className="w-1.5 h-4 bg-indigo-700 rounded-full"></div>
                    </div>
                    GencKalculator
                </Link>
                <nav className="flex items-center gap-8 text-[13px] font-medium text-slate-500">
                    <Link href="/" className="hover:text-indigo-600 transition-colors">Ana Sayfa</Link>
                    <Link href="/iletisim" className="text-slate-900 font-bold">İletişim</Link>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
                <div className="w-full max-w-2xl text-center space-y-10">
                    <h1 className="text-4xl font-medium text-slate-800 tracking-tight">İletişim</h1>
                    
                    <p className="text-slate-600 text-[15px]">
                        Bizimle <span className="font-bold text-slate-800">e-posta</span> yoluyla iletişime geçebilirsiniz - <a href="mailto:info@genckalculator.com" className="text-indigo-600 hover:underline font-medium">info@genckalculator.com</a>
                    </p>
                    
                    <p className="text-slate-600 text-[15px]">
                        Bizi <a href="#" className="text-indigo-600 hover:underline font-medium">Twitter</a> ve <a href="#" className="text-indigo-600 hover:underline font-medium">Instagram</a> üzerinden takip edin
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full max-w-5xl mx-auto border-t border-slate-100 py-8 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] text-slate-500 mb-8">
                <div className="flex-1 text-center md:text-left">
                    Copyright © {new Date().getFullYear()} <span className="text-indigo-600 font-medium">GencKalculator</span>. Tüm Hakları Saklıdır.
                </div>
                
                <div className="flex items-center gap-5 flex-1 justify-center">
                    <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 p-2 rounded-full"><InstagramIcon className="w-4 h-4" /></a>
                    <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 p-2 rounded-full"><TwitterIcon className="w-4 h-4 fill-current" /></a>
                </div>
                
                <div className="flex items-center gap-6 flex-1 justify-center md:justify-end">
                    <a href="#" className="hover:text-indigo-600 transition-colors">Gizlilik Politikası</a>
                    <a href="#" className="hover:text-indigo-600 transition-colors">Kullanım Koşulları</a>
                    <Link href="/iletisim" className="hover:text-indigo-600 transition-colors text-indigo-600 font-medium">İletişim</Link>
                </div>
            </footer>
        </div>
    );
}
