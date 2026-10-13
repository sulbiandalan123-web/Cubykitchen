// Konfigurasi Cuby Kitchen — Google Sheets
const STORE_CONFIG = {
  name: "Cuby Kitchen",
  city: "Jl. Griya Prasetya Sel. IV No.148, RT.08/RW.09, Pandean Lamper, Kec. Gayamsari, Kota Semarang, Jawa Tengah 50167",
  whatsapp: "081329456735",
  currency: "IDR",
  freeShippingMinimum: 150000,
  // URL /exec deployment Apps Script (aman ditaruh di frontend; PIN & token WA JANGAN)
  apiUrl: "https://script.google.com/macros/s/AKfycbxeRpQjzG3KjPUGtyEUoFsd8zkXiq8Zo5lpmVmfFYuWmwAUscH1BN2KjgpfE6f3NuLX/exec"
};

// Pengaturan bawaan. Bisa diubah dari admin-pengaturan.html (tersimpan di sheet PENGATURAN).
const SETTINGS={
  store:{location:'Gayamsari, Kota Semarang',address:'Jl. Griya Prasetya Sel. IV No.148, Pandean Lamper, Gayamsari, Semarang 50167',mapsUrl:''},
  hero:{ids:['','','']},
  spot:{id:''},
  text:{heroSub:'Rempah pilihan, sembako lengkap, dan bumbu dapur harian dari toko kelontong keluarga di Semarang Timur. Ambil di toko atau diantar ke seluruh Kota Semarang.'},
  shipping:{origin:'Pandean Lamper, Gayamsari, Kota Semarang',freeMin:0,minDelivery:30000,freeShip:{"Zona 1": 150000, "Zona 2": 250000},methods:{},localZones:{"Gayamsari (Zona 1)": 8000, "Semarang Timur (Zona 1)": 8000, "Pedurungan (Zona 1)": 8000, "Semarang Tengah (Zona 2)": 12000, "Semarang Selatan (Zona 2)": 12000, "Candisari (Zona 2)": 12000, "Genuk (Zona 2)": 12000, "Semarang Utara (Zona 2)": 12000, "Gajahmungkur (Zona 3)": 18000, "Tembalang (Zona 3)": 18000, "Semarang Barat (Zona 3)": 18000, "Banyumanik (Zona 3)": 18000, "Ngaliyan (Zona 4)": 25000, "Tugu (Zona 4)": 25000, "Mijen (Zona 4)": 25000, "Gunungpati (Zona 4)": 25000}},
  warranty:{months:12,testHours:48,returnDays:7},
  faq:[
    {q:"Bagaimana cara belanja?",a:"Pilih produk, masukkan ke keranjang, lalu checkout. Pilih ambil di toko atau antar ke alamat Anda di Kota Semarang. Pembayaran tunai saat terima atau transfer."},
    {q:"Apa itu harga grosir?",a:"Banyak produk punya harga grosir otomatis: beli sesuai jumlah minimum yang tertera di kartu produk, harga per satuan langsung turun. Tidak perlu daftar atau menunggu persetujuan."},
    {q:"Bagaimana harga reseller / warung?",a:"Warung dan reseller bisa mengajukan harga khusus saat checkout. Setelah disetujui admin, harga reseller berlaku untuk pembelian sesuai jumlah minimum."},
    {q:"Berapa ongkos antar dan kapan gratis ongkir?",a:"Ongkir mengikuti kecamatan tujuan di Kota Semarang (Zona 1–4). Zona 1 gratis ongkir untuk belanja mulai Rp 150.000, Zona 2 mulai Rp 250.000. Minimal belanja untuk diantar Rp 30.000. Ambil di toko tanpa ongkir."},
    {q:"Bagaimana jika barang tidak sesuai?",a:"Hubungi toko lewat WhatsApp pada hari yang sama saat barang diterima. Barang yang salah kirim atau rusak akan kami gantikan."}
  ]
};
function mergeSettings(o,s=SETTINGS){for(const k in o){if(o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k])&&s[k]&&typeof s[k]==='object')mergeSettings(o[k],s[k]);else s[k]=o[k]}return s}
