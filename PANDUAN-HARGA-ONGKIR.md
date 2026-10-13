# Harga & Ongkir — Cuby Kitchen (Kota Semarang)

Semua angka di bawah adalah REKOMENDASI AWAL. Sesuaikan dengan ongkos kurir/bensin dan margin toko.

## Tingkat harga (otomatis dipilih server, yang termurah berlaku)
1. **Eceran** — kolom `price` di sheet PRODUK.
2. **Grosir otomatis** — `hargaGrosir` + `minQtyGrosir`. Berlaku untuk siapa saja yang membeli sejumlah minimum. Tanpa persetujuan.
3. **Reseller / warung** — `hargaAgen` + `minQtyAgen`. Hanya untuk pelanggan yang statusnya DISETUJUI di sheet PELANGGAN.
Kolom ini bisa diisi dari `admin-produk.html` atau langsung di Sheet. Harga reseller tidak tampil di website publik.

## Ongkir antar (toko di Gayamsari, Semarang Timur)
| Zona | Tarif | Kecamatan | Gratis ongkir mulai |
|---|---|---|---|
| 1 | Rp 8.000 | Gayamsari, Semarang Timur, Pedurungan | Rp 150.000 |
| 2 | Rp 12.000 | Semarang Tengah, Semarang Selatan, Candisari, Genuk, Semarang Utara | Rp 250.000 |
| 3 | Rp 18.000 | Gajahmungkur, Tembalang, Semarang Barat, Banyumanik | tidak ada |
| 4 | Rp 25.000 | Ngaliyan, Tugu, Mijen, Gunungpati | tidak ada |

Minimal belanja untuk diantar: Rp 30.000. Ambil di toko tanpa ongkir.

## Mengubah angka
Ubah di DUA tempat agar website dan server sama:
- `js/config.js` → `SETTINGS.shipping` (`localZones`, `freeShip`, `minDelivery`)
- `google-apps-script/Code.gs` → `DEFAULT_SHIPPING`, lalu Deploy > New version.

## Mengisi produk
Impor `PRODUK-KELONTONG-TEMPLATE.csv` ke sheet PRODUK (File > Import > Replace current sheet). Harga, stok, dan grosir di file itu CONTOH.
