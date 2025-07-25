# 3 Boyutlu Depo Takip ve Yönetim Sistemi

Bu proje, modern web teknolojilerini kullanarak **3 Boyutlu Depo Takip ve Yönetim Sistemi** geliştirmeyi hedeflemektedir. Uygulama, depoları sanal ortamda 3D olarak görselleştirebilme, yeni depolar ekleyebilme ve mevcut depolardaki ürünleri etkin bir şekilde takip edebilme yetenekleri sunacaktır. Bu sistem, depo operasyonlarını optimize ederek verimliliği artırmayı ve envanter yönetimini kolaylaştırmayı amaçlamaktadır.

## Temel Özellikler (Planlanan)

* **3D Depo Görselleştirme:** Depoların ve içlerindeki ürünlerin üç boyutlu modellemesi ve etkileşimli görüntüsü.
* **Depo Ekleme/Yönetme:** Yeni depolar oluşturma, mevcut depoları düzenleme veya silme.
* **Ürün Takip ve Envanter Yönetimi:** Depolardaki ürünlerin giriş/çıkışını, konumunu ve stok durumunu takip etme.
* **Kullanıcı Yönetimi:** Sisteme erişim için kullanıcı kaydı, giriş ve yetkilendirme.

## Kullanılan Teknolojiler

* **Frontend:** Next.js (React tabanlı)
* **Backend:** Flask (Python tabanlı)
* **Veritabanı:** PostgreSQL (veya tercihe göre başka bir SQL veritabanı)

---

# Veritabanı Yapısı

Bu bölüm, projenin mevcut veritabanı şemasını ve ilişkilerini açıklamaktadır.

## Kullanıcılar (`users`) Tablosu

Kullanıcı bilgilerini saklamak için kullanılan temel tablodur.

**SQL Tanımı:**

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
