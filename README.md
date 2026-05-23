# GençKal Calculator & AI Diyet Planlayıcısı 

GençKal, kullanıcıların Beden Kitle İndeksi (BMI), Yağsız Vücut Kütlesi ve Vücut Yağ Kütlesi gibi önemli sağlık metriklerini hesaplayan, ardından bu verileri kullanarak Yapay Zeka (AI) destekli kişiselleştirilmiş diyet ve takviye planları oluşturan modern bir SaaS platformudur.

## Özellikler
* **Canlı Analiz Paneli:** Girilen fiziksel verilere göre anında BMI ve Yağsız Kütle hesaplaması.
* **İnteraktif Skala:** Matematiksel olarak kusursuz hizalanmış referans değerleri.
* **Modern UI/UX:** Zengin gradyanlar, asimetrik kart tasarımları ve cam efekti (glassmorphism) detayları.
* **AI Entegrasyonu:** Kullanıcı verilerine özel diyet planı oluşturma.

## Teknolojiler
* Next.js / React
* Tailwind CSS
* TypeScript

## Deployment
This project is configured for Vercel's default Next.js deployment path.

* Build command: `npm run build`
* Install command: `npm ci`
* Output directory: managed by Next.js and Vercel

Do not re-add GitHub Pages static export settings such as `output: 'export'`, `basePath: '/GencKal'`, `assetPrefix: '/GencKal/'`, or Actions jobs that upload a `dist` Pages artifact. Vercel should build the app directly from the repository root.

## Proje Görev Zaman Çizelgesi (Gantt Şeması)

```mermaid
%%{init: {'theme': 'dark', 'gantt': {'sectionFontSize': 14, 'fontSize': 12}}}%%
gantt
    title GençKal - Geliştirme Takvimi
    dateFormat  YYYY-MM-DD
    axisFormat  %d %b
    tickInterval 1week

    section Faz 1: UI
    Altyapı       :crit,    des1, 2026-02-23, 7d
    Algoritma     :crit,    des2, 2026-03-02, 7d

    section Faz 2: AI
    API           :active,  des3, 2026-03-09, 7d
    Veri Akışı    :         des4, 2026-03-16, 7d
    Sonuç Ekranı  :         des5, 2026-03-23, 7d

    section Faz 3: Backend
    Veritabanı    :         des6, 2026-03-30, 7d
    Auth (Giriş)  :         des7, 2026-04-06, 7d

    section Faz 4: Optimize
    AI Optimize   :         des8, 2026-04-13, 7d
    PDF & Mail    :         des9, 2026-04-20, 7d
    Test & QA     :         des10, 2026-04-27, 7d

    section Faz 5: Teslim
    Deploy        :         des11, 2026-05-04, 7d
    Sunum         :         des12, 2026-05-11, 7d
