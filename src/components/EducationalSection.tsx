// src/components/EducationalSection.tsx
import React from "react";

const tableContainerClass = "overflow-x-auto rounded-xl border border-slate-100 bg-white";
const tableClass = "w-full border-collapse text-left whitespace-nowrap";
const tableHeadClass = "bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-700";
const cellClass = "px-4 py-3";
const strongCellClass = `${cellClass} font-semibold`;
const formulaBlockClass = "my-4 rounded-2xl border border-indigo-100/80 bg-indigo-950/5 p-5 text-center";
const formulaLineClass = "font-mono text-sm tracking-wide text-indigo-600";
const formulaHighlightClass = "mt-2 font-mono text-sm font-semibold tracking-wide text-indigo-700";

const EducationalSection = React.memo(function EducationalSection() {
    return (
        <section className="bg-white px-4 pb-16 text-slate-700 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

                    {/* --- SOL KOLON: BMI BÖLÜMÜ --- */}
                    <section className="space-y-6">
                        <article className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                            <h2 className="mb-3 text-2xl font-bold text-slate-900">BMI (Vücut Kitle İndeksi) Nedir?</h2>
                            <p className="leading-relaxed text-slate-600">
                                BMI, boyunuza ve kilonuza dayanarak zayıflık veya şişmanlık derecenizi ölçen, doku kütlesini ölçmeyi amaçlayan bir hesaplamadır. Bir kişinin boyuna göre sağlıklı bir vücut ağırlığına sahip olup olmadığının genel bir göstergesi olarak yaygın şekilde kullanılır.
                            </p>

                            <h3 className="mt-6 mb-3 text-xl font-bold text-slate-800">BMI Formülü</h3>
                            <div className={formulaBlockClass}>
                                <p className={formulaLineClass}>BMI = Kilo (kg) / ( Boy (m) * Boy (m) )</p>
                                <p className={formulaHighlightClass}>Örnek: 75 kg / (1.75 * 1.75) = 24.49</p>
                            </div>
                        </article>

                        <article className="-mt-8 rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                            <h3 className="mb-3 text-xl font-bold text-slate-800">Yetişkinler İçin BMI Tablosu (DSÖ)</h3>
                            <div className={tableContainerClass}>
                                <table className={tableClass}>
                                    <thead className={tableHeadClass}>
                                        <tr>
                                            <th className={cellClass}>Sınıflandırma</th>
                                            <th className={`${cellClass} text-right`}>BMI Aralığı (kg/m²)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-slate-600">
                                        <tr className="border-b border-slate-300"><td className={`${cellClass} font-medium text-slate-700`}>İleri Derece Zayıflık</td><td className={`${cellClass} text-right font-semibold text-slate-800`}>&lt; 16</td></tr>
                                        <tr className="border-b border-slate-300"><td className={`${cellClass} font-medium text-slate-700`}>Orta Derece Zayıflık</td><td className={`${cellClass} text-right font-semibold text-slate-800`}>16 - 17</td></tr>
                                        <tr className="border-b border-slate-300"><td className={`${cellClass} font-medium text-slate-700`}>Hafif Zayıflık</td><td className={`${cellClass} text-right font-semibold text-slate-800`}>17 - 18.5</td></tr>
                                        <tr className="border-b border-slate-300"><td className={`${cellClass} font-medium text-slate-700`}>Normal</td><td className={`${cellClass} text-right font-semibold text-slate-800`}>18.5 - 25</td></tr>
                                        <tr className="border-b border-slate-300"><td className={`${cellClass} font-medium text-slate-700`}>Fazla Kilolu</td><td className={`${cellClass} text-right font-semibold text-slate-800`}>25 - 30</td></tr>
                                        <tr className="border-b border-slate-300"><td className={`${cellClass} font-semibold text-slate-700`}>Obez (1. Derece)</td><td className={`${cellClass} text-right font-semibold text-slate-800`}>30 - 35</td></tr>
                                        <tr className="border-b border-slate-300"><td className={`${cellClass} font-semibold text-slate-700`}>Obez (2. Derece)</td><td className={`${cellClass} text-right font-semibold text-slate-800`}>35 - 40</td></tr>
                                        <tr><td className={`${cellClass} font-semibold text-slate-700`}>Aşırı Obez (3. Derece)</td><td className={`${cellClass} text-right font-semibold text-slate-800`}>&gt; 40</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </article>

                        <article className="-mt-8 rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                            <h3 className="mb-3 text-xl font-bold text-slate-800">BMI&apos;nin Sınırları</h3>
                            <p className="mb-4 leading-relaxed text-slate-600">
                                BMI sağlıklı vücut ağırlığını belirlemek için yaygın olsa da, kas ve yağ oranını dikkate almayan sadece bir tahmindir.
                            </p>
                            <ul className="mb-8 list-disc space-y-2 pl-6 text-slate-600">
                                <li><strong>Sporcular:</strong> Kas yağdan daha ağır olduğu için yüksek kas kütlesine sahip kişiler BMI&apos;ye göre &quot;Obez&quot; çıkabilir, ancak aslında son derece sağlıklıdırlar.</li>
                                <li><strong>Yaşlı Yetişkinler:</strong> Aynı BMI değerine sahip gençlere kıyasla daha fazla vücut yağına sahip olma eğilimindedirler.</li>
                            </ul>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <h4 className="px-4 text-lg font-bold text-slate-800">Fazla Kilo Riskleri</h4>
                                    <div className={`${tableContainerClass} -mt-1`}>
                                        <table className={tableClass}>
                                            <tbody className="text-sm text-slate-600">
                                                <tr className="border-b border-slate-300"><td className={`${cellClass} font-medium text-slate-700`}>Yüksek tansiyon ve kolesterol</td></tr>
                                                <tr className="border-b border-slate-300"><td className={`${cellClass} font-medium text-slate-700`}>Tip II diyabet</td></tr>
                                                <tr className="border-b border-slate-300"><td className={`${cellClass} font-medium text-slate-700`}>Koroner kalp hastalığı</td></tr>
                                                <tr><td className={`${cellClass} font-medium text-slate-700`}>Uyku apnesi</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="px-4 text-lg font-bold text-slate-800">Düşük Kilo Riskleri</h4>
                                    <div className={`${tableContainerClass} -mt-1`}>
                                        <table className={tableClass}>
                                            <tbody className="text-sm text-slate-600">
                                                <tr className="border-b border-slate-300"><td className={`${cellClass} font-medium text-slate-700`}>Yetersiz beslenme ve anemi</td></tr>
                                                <tr className="border-b border-slate-300"><td className={`${cellClass} font-medium text-slate-700`}>Osteoporoz (Kemik erimesi)</td></tr>
                                                <tr className="border-b border-slate-300"><td className={`${cellClass} font-medium text-slate-700`}>Zayıf bağışıklık sistemi</td></tr>
                                                <tr><td className={`${cellClass} font-medium text-slate-700`}>Büyüme sorunları</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </section>

                    {/* --- SAĞ KOLON: FFMI BÖLÜMÜ --- */}
                    <section className="space-y-6">
                        <article className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                            <h2 className="mb-3 text-2xl font-bold text-slate-900">FFMI (Yağsız Vücut Kitle İndeksi) Nedir?</h2>
                            <p className="leading-relaxed text-slate-600">
                                FFMI, boyunuza oranla ne kadar kas kütlesine sahip olduğunuzu hesaplamanızı sağlayan bir indekstir. Bu indeks, vücut geliştiriciler ve sporcular tarafından gelişimlerini takip etmek için yaygın olarak kullanılır ve BMI&apos;ye göre çok daha güvenilirdir.
                            </p>

                            <h3 className="mt-6 mb-3 text-xl font-bold text-slate-800">FFMI Formülü</h3>
                            <div className={formulaBlockClass}>
                                <div className="space-y-2">
                                    <p className={formulaLineClass}>Vücut Yağı = Kilo * (Yağ Oranı [%] / 100)</p>
                                    <p className={formulaLineClass}>Yağsız Kütle = Kilo - Vücut Yağı</p>
                                    <p className={formulaLineClass}>FFMI = Yağsız Kütle (kg) / Boy (m)<sup>2</sup></p>
                                </div>
                                <p className={formulaHighlightClass}>Norm. FFMI = FFMI + 6.1 * (1.8 - Boy (m))</p>
                            </div>
                        </article>

                        <article className="-mt-8 rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                            <h3 className="mb-3 text-xl font-bold text-slate-800">Erkekler İçin FFMI Skorları</h3>
                            <div className={tableContainerClass}>
                                <table className={tableClass}>
                                    <thead className={tableHeadClass}>
                                        <tr>
                                            <th className={cellClass}>FFMI</th>
                                            <th className={cellClass}>Yağ Oranı</th>
                                            <th className={cellClass}>Açıklama</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-slate-600">
                                        <tr className="border-b border-slate-300"><td className={`${strongCellClass} text-slate-800`}>17-18</td><td className={cellClass}>10-18%</td><td className={`${cellClass} font-medium text-slate-700`}>Zayıf</td></tr>
                                        <tr className="border-b border-slate-300"><td className={`${strongCellClass} text-slate-800`}>18-20</td><td className={cellClass}>20-27%</td><td className={`${cellClass} font-medium text-slate-700`}>Ortalama</td></tr>
                                        <tr className="border-b border-slate-300"><td className={`${strongCellClass} text-slate-800`}>19-21</td><td className={cellClass}>25-40%</td><td className={`${cellClass} font-medium text-slate-700`}>Kilolu</td></tr>
                                        <tr className="border-b border-slate-300"><td className={`${strongCellClass} text-slate-800`}>20-21</td><td className={cellClass}>10-18%</td><td className={`${cellClass} font-medium text-slate-700`}>Sporcu / Orta Seviye</td></tr>
                                        <tr className="border-b border-slate-300"><td className={`${strongCellClass} text-slate-800`}>22-23</td><td className={cellClass}>6-12%</td><td className={`${cellClass} font-medium text-slate-700`}>İleri Seviye Sporcu</td></tr>
                                        <tr><td className={`${strongCellClass} text-slate-800`}>24-25</td><td className={cellClass}>8-20%</td><td className={`${cellClass} font-semibold text-slate-700`}>Vücut Geliştirici</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </article>

                        <article className="-mt-8 rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                            <h3 className="mb-3 text-xl font-bold text-slate-800">Kadınlar İçin FFMI Skorları</h3>
                            <div className={tableContainerClass}>
                                <table className={tableClass}>
                                    <thead className={tableHeadClass}>
                                        <tr>
                                            <th className={cellClass}>FFMI</th>
                                            <th className={cellClass}>Yağ Oranı</th>
                                            <th className={cellClass}>Açıklama</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-slate-600">
                                        <tr className="border-b border-slate-300"><td className={`${strongCellClass} text-slate-800`}>14-15</td><td className={cellClass}>20-25%</td><td className={`${cellClass} font-medium text-slate-700`}>Zayıf</td></tr>
                                        <tr className="border-b border-slate-300"><td className={`${strongCellClass} text-slate-800`}>14-17</td><td className={cellClass}>22-35%</td><td className={`${cellClass} font-medium text-slate-700`}>Ortalama</td></tr>
                                        <tr className="border-b border-slate-300"><td className={`${strongCellClass} text-slate-800`}>15-18</td><td className={cellClass}>30-45%</td><td className={`${cellClass} font-medium text-slate-700`}>Kilolu</td></tr>
                                        <tr className="border-b border-slate-300"><td className={`${strongCellClass} text-slate-800`}>16-17</td><td className={cellClass}>18-25%</td><td className={`${cellClass} font-medium text-slate-700`}>Sporcu / Orta Seviye</td></tr>
                                        <tr className="border-b border-slate-300"><td className={`${strongCellClass} text-slate-800`}>18-20</td><td className={cellClass}>15-22%</td><td className={`${cellClass} font-medium text-slate-700`}>İleri Seviye Sporcu</td></tr>
                                        <tr><td className={`${strongCellClass} text-slate-800`}>19-21</td><td className={cellClass}>15-30%</td><td className={`${cellClass} font-semibold text-slate-700`}>Vücut Geliştirici</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </article>
                    </section>

                </div>
            </div>
        </section>
    );
}
);

export default EducationalSection;
