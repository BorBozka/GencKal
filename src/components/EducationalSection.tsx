// src/components/EducationalSection.tsx
import React from "react";

const EducationalSection = React.memo(function EducationalSection() {
    return (
        <section className="bg-white text-gray-800 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                    {/* --- SOL KOLON: BMI BÖLÜMÜ --- */}
                    <section>
                        <h2 className="text-3xl font-bold mb-4 text-center text-indigo-900">BMI (Vücut Kitle İndeksi) Nedir?</h2>
                        <p className="mb-6 leading-relaxed">
                            BMI, boyunuza ve kilonuza dayanarak zayıflık veya şişmanlık derecenizi ölçen, doku kütlesini ölçmeyi amaçlayan bir hesaplamadır. Bir kişinin boyuna göre sağlıklı bir vücut ağırlığına sahip olup olmadığının genel bir göstergesi olarak yaygın şekilde kullanılır.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-indigo-800">BMI Formülü</h3>
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-8 font-mono text-xs sm:text-sm">
                            <p>BMI = Kilo (kg) / ( Boy (m) * Boy (m) )</p>
                            <p className="mt-2 text-indigo-600 font-bold">Örnek: 75 kg / (1.75 * 1.75) = 24.49</p>
                        </div>

                        <h3 className="text-xl font-semibold mb-3 text-indigo-800">Yetişkinler İçin BMI Tablosu (DSÖ)</h3>
                        <div className="overflow-x-auto mb-8">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="border-b-2 border-indigo-200 bg-indigo-50">
                                        <th className="p-3">Sınıflandırma</th>
                                        <th className="p-3">BMI Aralığı (kg/m²)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b"><td className="p-3">İleri Derece Zayıflık</td><td className="p-3">&lt; 16</td></tr>
                                    <tr className="border-b bg-gray-50"><td className="p-3">Orta Derece Zayıflık</td><td className="p-3">16 - 17</td></tr>
                                    <tr className="border-b"><td className="p-3">Hafif Zayıflık</td><td className="p-3">17 - 18.5</td></tr>
                                    <tr className="border-b bg-green-50 font-semibold text-green-800"><td className="p-3">Normal</td><td className="p-3">18.5 - 25</td></tr>
                                    <tr className="border-b bg-yellow-50"><td className="p-3">Fazla Kilolu</td><td className="p-3">25 - 30</td></tr>
                                    <tr className="border-b bg-orange-50"><td className="p-3">Obez (1. Derece)</td><td className="p-3">30 - 35</td></tr>
                                    <tr className="border-b bg-red-50"><td className="p-3">Obez (2. Derece)</td><td className="p-3">35 - 40</td></tr>
                                    <tr className="bg-red-100 text-red-900 font-semibold"><td className="p-3">Aşırı Obez (3. Derece)</td><td className="p-3">&gt; 40</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-xl font-semibold mb-3 text-indigo-800">BMI&apos;nin Sınırları</h3>
                        <p className="mb-4 leading-relaxed">
                            BMI sağlıklı vücut ağırlığını belirlemek için yaygın olsa da, kas ve yağ oranını dikkate almayan sadece bir tahmindir.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-8 text-gray-700">
                            <li><strong>Sporcular:</strong> Kas yağdan daha ağır olduğu için yüksek kas kütlesine sahip kişiler BMI&apos;ye göre &quot;Obez&quot; çıkabilir, ancak aslında son derece sağlıklıdırlar.</li>
                            <li><strong>Yaşlı Yetişkinler:</strong> Aynı BMI değerine sahip gençlere kıyasla daha fazla vücut yağına sahip olma eğilimindedirler.</li>
                        </ul>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-red-700">Fazla Kilo Riskleri</h3>
                                <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                                    <li>Yüksek tansiyon ve kolesterol</li>
                                    <li>Tip II diyabet</li>
                                    <li>Koroner kalp hastalığı</li>
                                    <li>Uyku apnesi</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-yellow-600">Düşük Kilo Riskleri</h3>
                                <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                                    <li>Yetersiz beslenme ve anemi</li>
                                    <li>Osteoporoz (Kemik erimesi)</li>
                                    <li>Zayıf bağışıklık sistemi</li>
                                    <li>Büyüme sorunları</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* --- SAĞ KOLON: FFMI BÖLÜMÜ --- */}
                    <section>
                        <h2 className="text-3xl font-bold mb-4 text-center text-indigo-900">FFMI (Yağsız Vücut Kütlesi İndeksi) Nedir?</h2>
                        <p className="mb-6 leading-relaxed">
                            FFMI, boyunuza oranla ne kadar kas kütlesine sahip olduğunuzu hesaplamanızı sağlayan bir indekstir. Bu indeks, vücut geliştiriciler ve sporcular tarafından gelişimlerini takip etmek için yaygın olarak kullanılır ve BMI&apos;ye göre çok daha güvenilirdir.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-indigo-800">FFMI Formülü</h3>
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-8 font-mono text-xs sm:text-sm">
                            <p>Vücut Yağı = Kilo * (Yağ Oranı [%] / 100)</p>
                            <p>Yağsız Kütle = Kilo - Vücut Yağı</p>
                            <p>FFMI = Yağsız Kütle (kg) / Boy (m)<sup>2</sup></p>
                            <p className="mt-2 text-indigo-600 font-bold">Norm. FFMI = FFMI + 6.1 * (1.8 - Boy (m))</p>
                        </div>

                        <h3 className="text-xl font-semibold mb-3 text-indigo-800">Erkekler İçin FFMI Skorları</h3>
                        <div className="overflow-x-auto mb-8">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="border-b-2 border-indigo-200">
                                        <th className="p-3">FFMI</th>
                                        <th className="p-3">Yağ Oranı</th>
                                        <th className="p-3">Açıklama</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    <tr className="border-b"><td className="p-3 font-semibold">17-18</td><td className="p-3">10-18%</td><td className="p-3">Zayıf</td></tr>
                                    <tr className="border-b bg-gray-50"><td className="p-3 font-semibold">18-20</td><td className="p-3">20-27%</td><td className="p-3">Ortalama</td></tr>
                                    <tr className="border-b"><td className="p-3 font-semibold">19-21</td><td className="p-3">25-40%</td><td className="p-3">Kilolu</td></tr>
                                    <tr className="border-b bg-gray-50"><td className="p-3 font-semibold">20-21</td><td className="p-3">10-18%</td><td className="p-3">Sporcu / Orta Seviye</td></tr>
                                    <tr className="border-b"><td className="p-3 font-semibold">22-23</td><td className="p-3">6-12%</td><td className="p-3">İleri Seviye Sporcu</td></tr>
                                    <tr className="border-b bg-gray-50"><td className="p-3 font-semibold">24-25</td><td className="p-3">8-20%</td><td className="p-3">Vücut Geliştirici</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-xl font-semibold mb-3 text-indigo-800">Kadınlar İçin FFMI Skorları</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="border-b-2 border-indigo-200">
                                        <th className="p-3">FFMI</th>
                                        <th className="p-3">Yağ Oranı</th>
                                        <th className="p-3">Açıklama</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    <tr className="border-b"><td className="p-3 font-semibold">14-15</td><td className="p-3">20-25%</td><td className="p-3">Zayıf</td></tr>
                                    <tr className="border-b bg-gray-50"><td className="p-3 font-semibold">14-17</td><td className="p-3">22-35%</td><td className="p-3">Ortalama</td></tr>
                                    <tr className="border-b"><td className="p-3 font-semibold">15-18</td><td className="p-3">30-45%</td><td className="p-3">Kilolu</td></tr>
                                    <tr className="border-b bg-gray-50"><td className="p-3 font-semibold">16-17</td><td className="p-3">18-25%</td><td className="p-3">Sporcu / Orta Seviye</td></tr>
                                    <tr className="border-b"><td className="p-3 font-semibold">18-20</td><td className="p-3">15-22%</td><td className="p-3">İleri Seviye Sporcu</td></tr>
                                    <tr className="border-b bg-gray-50"><td className="p-3 font-semibold">19-21</td><td className="p-3">15-30%</td><td className="p-3">Vücut Geliştirici</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                </div>
            </div>
        </section>
    );
}
);

export default EducationalSection;
