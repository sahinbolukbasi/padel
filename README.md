# İnteraktif Padel Tenisi Rehberi

Modern, mobil uyumlu ve etkileşimli bir Padel rehberi ve bağımsız skor bord uygulaması.

## İçerik

- Ana rehber sayfası: saha bölgeleri, hareket animasyonları, kurallar, formatlar, hatalar/fauller
- AI asistan: Gemini API anahtarı ile padel odaklı sohbet
- Bağımsız skor bord: tam ekran, mobil öncelikli, gerçek maç akışına uygun puanlama

## Kullanım

### 1) Ana rehber

- Dosya: index.html
- Bölümler:
  - Sahayı Tanı: etkileşimli saha alanları
  - Hareketi Gör/Anla: animasyonlu vuruş senaryoları
  - Kurallar, formatlar ve fauller
  - AI sohbet asistanı (opsiyonel API anahtarı ile)

### 2) Skor bord

- Dosya: scoreboard.html
- Özellikler:
  - Takım adı + set formatı seçimi
  - Puan, oyun, set ve tie-break yönetimi
  - Geri al, sıfırla ve yeni maç başlat akışı

## Gemini API Ayarı

1. Ana sayfada sağ alttaki AI butonunu açın.
2. Google AI Studio üzerinden aldığınız Gemini API anahtarını girin.
3. Anahtar yerel depolamada saklanır ve tekrar giriş istemez.

Not: API anahtarı tarayıcı tarafında kullanıldığı için herkese açık ortamlarda dikkatli kullanılmalıdır.

## Yerelde Çalıştırma

Bu proje statik dosyalardan oluşur, build adımı yoktur.

Seçenek 1: Dosyaları doğrudan tarayıcıda açabilirsiniz.

Seçenek 2: Basit bir yerel sunucu ile çalıştırın:

```bash
python3 -m http.server 5500
```

Ardından:

- http://localhost:5500/index.html
- http://localhost:5500/scoreboard.html

## GitHub Pages Yayını

Bu repo kökünde statik dosyalar bulunduğu için GitHub Pages ile doğrudan yayınlanabilir.

Önerilen ayar:

- Repository Settings > Pages
- Source: Deploy from a branch
- Branch: main / root

## Dosya Yapısı

- index.html: Ana rehber sayfası
- style.css: Ana rehber stilleri
- script.js: Ana rehber etkileşimleri
- scoreboard.html: Bağımsız skor bord sayfası
- scoreboard.css: Skor bord stilleri
- scoreboard.js: Skor bord state ve puanlama motoru

## Geliştirici

Geliştiren: Şahin Bölükbaşı
- LinkedIn: https://www.linkedin.com/in/sahinbolukbasi/
