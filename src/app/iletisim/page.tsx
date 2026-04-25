import React from 'react';
import Link from 'next/link';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col">
            {/* Header */}
            <header className="w-full flex justify-between items-center py-6 px-8 md:px-16">
                <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-indigo-700">
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-4 bg-indigo-700 rounded-full"></div>
                        <div className="w-1.5 h-6 bg-indigo-700 rounded-full"></div>
                        <div className="w-1.5 h-4 bg-indigo-700 rounded-full"></div>
                    </div>
                    genckalcalculator
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
                        Bizimle <span className="font-bold text-slate-800">e-posta</span> yoluyla iletişime geçebilirsiniz - <a href="mailto:info@genckalcalculator.com" className="text-indigo-600 hover:underline font-medium">info@genckalcalculator.com</a>
                    </p>
                    
                    <p className="text-slate-600 text-[15px]">
                        Bizi <a href="#" className="text-indigo-600 hover:underline font-medium">Twitter</a> ve <a href="#" className="text-indigo-600 hover:underline font-medium">Facebook</a> üzerinden takip edin
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full max-w-5xl mx-auto border-t border-slate-100 py-8 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] text-slate-500 mb-8">
                <div className="flex-1 text-center md:text-left">
                    Copyright © {new Date().getFullYear()} <span className="text-indigo-600 font-medium">GençKal Calculator</span>. Tüm Hakları Saklıdır.
                </div>
                
                <div className="flex items-center gap-5 flex-1 justify-center">
                    <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 p-2 rounded-full"><FacebookIcon className="w-4 h-4 fill-current" /></a>
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
