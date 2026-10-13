// Konfigurasi Cuby Kitchen — Google Sheets
const STORE_CONFIG = {
  name: "Cuby Kitchen",
  city: "Jl. Griya Prasetya Sel. IV No.148, RT.08/RW.09, Pandean Lamper, Kec. Gayamsari, Kota Semarang, Jawa Tengah 50167",
  whatsapp: "081329456735",
  currency: "IDR",
  freeShippingMinimum: 300000,
  // URL /exec deployment Apps Script (aman ditaruh di frontend; PIN & token WA JANGAN)
  apiUrl: "https://script.google.com/macros/s/AKfycbxeRpQjzG3KjPUGtyEUoFsd8zkXiq8Zo5lpmVmfFYuWmwAUscH1BN2KjgpfE6f3NuLX/exec"
};

// Pengaturan bawaan. Bisa diubah dari admin-pengaturan.html (tersimpan di sheet PENGATURAN).
const SETTINGS={
  store:{location:'ISI ALAMAT CUBY KITCHEN',address:'',mapsUrl:''},
  hero:{ids:['','','']},
  spot:{id:''},
  text:{heroSub:'Kebutuhan sembako harian dengan pilihan ambil di toko atau antar lokal.'},
  shipping:{origin:'ISI ALAMAT CUBY KITCHEN',freeMin:0,methods:{},localZones:{'Zona 1':5000,'Zona 2':10000,'Zona 3':15000}},
  warranty:{months:12,testHours:48,returnDays:7},
  faq:[
    {q:'Bagaimana cara membeli?',a:'Pilih produk, masukkan ke keranjang, lalu checkout. Kamu bisa mengambil pesanan di toko atau memilih antar lokal.'},
    {q:'Bagaimana harga agen berlaku?',a:'Harga agen hanya berlaku untuk pelanggan yang sudah disetujui admin dan jika produk memenuhi ketentuan minimum pembelian.'},
    {q:'Bagaimana pembayaran?',a:'Pilih tunai saat ambil/terima atau transfer bank. Untuk transfer, tunggu instruksi dari admin toko.'}
  ]
};
function mergeSettings(o,s=SETTINGS){for(const k in o){if(o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k])&&s[k]&&typeof s[k]==='object')mergeSettings(o[k],s[k]);else s[k]=o[k]}return s}
