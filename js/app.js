const byId=id=>PRODUCTS.find(p=>p.id===id);
const idr=n=>'Rp '+n.toLocaleString('id-ID');
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const icons=()=>window.lucide&&lucide.createIcons();

/* foto + fallback svg */
const EMO=p=>{const t=((p.name||'')+' '+(p.cat||'')).toLowerCase();return /beras|tepung/.test(t)?'🌾':/minyak/.test(t)?'🫙':/gula|garam/.test(t)?'🧂':/telur/.test(t)?'🥚':/lada|merica|cabai|cabe/.test(t)?'🌶️':/kunyit|jahe/.test(t)?'🫚':/kayu manis|cengkeh|pala|kapulaga|ketumbar|salam|rempah/.test(t)?'🌿':/kecap|saus|santan|bumbu/.test(t)?'🥫':/mi |mie/.test(t)?'🍜':'🛒'};
const art=p=>`${(!p.art&&!p.img)?`<span class="eph" aria-hidden="true">${EMO(p)}</span>`:''}${p.art?`<svg viewBox="0 0 240 240" aria-hidden="true"><use href="#${p.art}"/></svg>`:''}${p.img?`<img src="${String(p.img).replace(/"/g,'&quot;')}" alt="${String(p.name||'').replace(/"/g,'&quot;')}" loading="lazy" onerror="this.remove()">`:''}`;

/* ================= TOAST ================= */
function toast(msg,ok=true){
  const t=document.createElement('div');
  t.className='toast'+(ok?'':' err');
  t.innerHTML=`<i data-lucide="${ok?'check-circle':'x-circle'}" class="ic"></i><span>${msg}</span>`;
  $('#toasts').appendChild(t); icons();
  setTimeout(()=>t.classList.add('out'),2600);
  setTimeout(()=>t.remove(),3100);
}

/* ================= KERANJANG ================= */
let cart=new Map(JSON.parse(localStorage.getItem('cuby_cart')||'[]'));
const save=()=>localStorage.setItem('cuby_cart',JSON.stringify([...cart]));
const cartQty=()=>{let n=0;cart.forEach(q=>n+=q);return n};

function updateBadge(bump){
  const n=cartQty();
  $('#cartCount').textContent=n;
  $('#dCount').textContent=`(${n})`;
  if(bump){const b=$('#cartBtn');b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump');}
}
function addToCart(id,qty=1){
  cart.set(id,(cart.get(id)||0)+qty);
  save(); renderCart(); updateBadge(true);
  toast(`${byId(id).name} masuk keranjang`);
}
function renderCart(){
  const box=$('#cartItems');
  if(!cart.size){
    box.innerHTML=`<div class="cempty"><i data-lucide="shopping-cart" class="ic"></i><p>Keranjang masih kosong</p><span>Yuk pilih produk di katalog</span></div>`;
  }else{
    box.innerHTML=[...cart].map(([id,q])=>{const p=byId(id);return `
    <div class="citem">
      <div class="cthumb">${art(p)}</div>
      <div class="cinfo2">
        <p class="pcat">${p.cat} /${p.no}</p>
        <h4>${p.name}</h4>
        <div class="stepper">
          <button data-act="dec" data-id="${id}" aria-label="Kurangi"><i data-lucide="minus" class="ic"></i></button>
          <span>${q}</span>
          <button data-act="inc" data-id="${id}" aria-label="Tambah"><i data-lucide="plus" class="ic"></i></button>
        </div>
      </div>
      <div class="cright">
        <p class="pprice"><b>${idr(unitPrice(p,q)*q)}</b></p>
        <button class="rm" data-act="rm" data-id="${id}" aria-label="Hapus"><i data-lucide="trash-2" class="ic"></i></button>
      </div>
    </div>`}).join('');
  }
  let sub=0; cart.forEach((q,id)=>sub+=byId(id).price*q);
  $('#sumSub').textContent=idr(sub);
  $('#sumShip').textContent='Pilih ambil atau antar saat checkout';
  $('#sumTotal').textContent=idr(sub);
  $('#shipFill').style.width='0%';
  $('#shipLabel').textContent='Ambil di toko gratis atau pilih antar lokal saat checkout.';
  icons();
}
 $('#cartItems').addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b)return;
  const id=b.dataset.id, q=cart.get(id)||0;
  if(b.dataset.act==='inc')cart.set(id,q+1);
  if(b.dataset.act==='dec'){q<=1?cart.delete(id):cart.set(id,q-1)}
  if(b.dataset.act==='rm'){cart.delete(id);toast(`${byId(id).name} dihapus`,false)}
  save(); renderCart(); updateBadge(); if(view==='checkout')renderCheckout();
});

/* ================= VIEW DRAWER ================= */
let view='cart';
function showView(v){
  view=v;
  $('#cartView').hidden = v!=='cart';
  $('#cartFoot').hidden = v!=='cart';
  $('#coBody').hidden   = v!=='checkout';
  $('#cartDone').hidden = v!=='done';
  $('#dTitle').textContent = v==='cart'?'Keranjang':v==='checkout'?'Checkout':'Selesai';
  const idx=v==='cart'?1:v==='checkout'?2:3;
  $('#coRail').innerHTML=['Keranjang','Checkout','Selesai']
    .map((s,j)=>`<span class="${j+1===idx?'on':''}"><b>${j+1}</b>${s}</span>`).join('<i>—</i>');
  icons();
}

/* ================= CHECKOUT TOKO KELONTONG ================= */
let FREE_MIN=0;
let LOCAL_ZONES=(SETTINGS.shipping&&SETTINGS.shipping.localZones)||{'Zona 1':5000,'Zona 2':10000,'Zona 3':15000};
let co={delivery:'AMBIL',zone:'',pay:'cash'};
const PAY={cash:{label:'Tunai saat ambil/terima',flow:'Bayar tunai saat barang diterima',icon:'banknote'},transfer:{label:'Transfer bank',flow:'Admin mengirim instruksi pembayaran',icon:'wallet'}};
function safeText(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function unitPrice(p,q){const g=Number(p.hargaGrosir)||0,m=Number(p.minQtyGrosir)||0;return g>0&&m>0&&g<Number(p.price)&&q>=m?g:Number(p.price||0)}
function zoneTag(z){const m=String(z||'').match(/\(([^)]+)\)\s*$/);return m?m[1]:''}
function shipInfo(sub){if(co.delivery!=='ANTAR')return{fee:0,base:0,free:false,freeMin:0,minDel:0};const S=SETTINGS.shipping||{};const base=Number(LOCAL_ZONES[co.zone]||0);const fm=Number((S.freeShip||{})[zoneTag(co.zone)]||0);const free=base>0&&fm>0&&sub>=fm;return{fee:free?0:base,base,free,freeMin:fm,minDel:Number(S.minDelivery||0)}}
function totals(){let sub=0;cart.forEach((q,id)=>{const p=byId(id);if(p)sub+=unitPrice(p,q)*q});const info=shipInfo(sub);return{sub,ship:info.fee,info,total:sub+info.fee};}
function fillZoneOptions(){const el=$('#agCity');if(!el)return;const old=el.value;el.innerHTML='<option value="">Pilih kecamatan tujuan</option>'+Object.entries(LOCAL_ZONES).map(([k,v])=>`<option value="${safeText(k)}">${safeText(k)} — ${idr(Number(v)||0)}</option>`).join('');if(old&&LOCAL_ZONES[old]!=null)el.value=old;}
function renderCheckout(){
  fillZoneOptions();
  const delivery=$('#deliveryMethod');if(delivery)delivery.value=co.delivery;
  $('#deliveryAddress').hidden=co.delivery!=='ANTAR';
  $('#agentStoreField').hidden=$('#customerType').value!=='AGEN';
  $('#payCards').innerHTML=Object.entries(PAY).map(([k,m])=>`<button type="button" class="paycard${co.pay===k?' on':''}" data-pay="${k}"><span class="pc-name"><i data-lucide="${m.icon}" class="ic"></i>${m.label}</span><span class="pc-flow">${m.flow}</span></button>`).join('');
  const t=totals();const I=t.info;const hint=co.delivery==='ANTAR'&&co.zone?(I.free?'<p class="conote">🎉 Gratis ongkir untuk kecamatan ini.</p>':(I.freeMin>t.sub?`<p class="conote">Belanja ${idr(I.freeMin-t.sub)} lagi untuk gratis ongkir.</p>`:'')+(I.minDel>t.sub?`<p class="conote" style="color:#B91C1C">Minimal belanja untuk diantar ${idr(I.minDel)}.</p>`:'')):'';
  $('#coSum').innerHTML=`<div class="srow"><span>Subtotal barang</span><span>${idr(t.sub)}</span></div><div class="srow"><span>${co.delivery==='ANTAR'?'Ongkir '+safeText(co.zone||'zona belum dipilih'):'Ambil di toko'}</span><span>${co.delivery==='ANTAR'&&I.free?'Gratis':(t.ship?idr(t.ship):'Rp 0')}</span></div><div class="srow total"><span>Total pesanan</span><span>${idr(t.total)}</span></div>${hint}<p class="conote">Harga dan stok akan diverifikasi ulang oleh server saat pesanan dikirim.</p>`;
  icons();
}
$('#coBody').addEventListener('click',e=>{const p=e.target.closest('[data-pay]');if(p){co.pay=p.dataset.pay;renderCheckout();}});
$('#customerType').addEventListener('change',()=>{ $('#agentStoreField').hidden=$('#customerType').value!=='AGEN'; });
$('#deliveryMethod').addEventListener('change',()=>{co.delivery=$('#deliveryMethod').value;renderCheckout();});
$('#agCity').addEventListener('change',()=>{co.zone=$('#agCity').value;renderCheckout();});
$('#coForm').addEventListener('submit',async e=>{
 e.preventDefault(); if(!cart.size){toast('Keranjang masih kosong',false);showView('cart');return;}
 const type=$('#customerType').value, name=$('#agName').value.trim(), wa=$('#agWa').value.trim(), store=$('#agentStore').value.trim(), addr=$('#agAddr').value.trim();
 if(name.length<2||!/^[0-9+()\-\s]{8,18}$/.test(wa)){toast('Isi nama dan nomor WhatsApp yang valid',false);return;}
 if(type==='AGEN'&&store.length<2){toast('Nama toko wajib diisi untuk pengajuan reseller',false);return;}
 if(co.delivery==='ANTAR'&&(!co.zone||!addr||addr.length<6)){toast('Pilih kecamatan dan isi alamat antar lengkap',false);return;}
 if(co.delivery==='ANTAR'&&totals().sub<Number((SETTINGS.shipping||{}).minDelivery||0)){toast('Minimal belanja untuk diantar '+idr(Number(SETTINGS.shipping.minDelivery)),false);return;}
 const items=[...cart].map(([id,qty])=>({id,qty}));
 const payload={action:'order',requestId:(window.crypto&&crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(16).slice(2)),customer:{name,wa,type,store},shipping:{method:co.delivery,zone:co.delivery==='ANTAR'?co.zone:'',address:co.delivery==='ANTAR'?addr:''},payment:{key:co.pay,label:PAY[co.pay].label},items};
 const btn=e.submitter||$('#coForm button[type="submit"]');if(btn){btn.disabled=true;btn.dataset.oldText=btn.textContent;btn.textContent='Memeriksa stok…';}
 try{const res=await fetch(STORE_CONFIG.apiUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});const data=await res.json();if(!data.ok)throw new Error(data.error||'Pesanan gagal disimpan');
 $('#orderNo').textContent=data.orderNo;$('#waNote').textContent=type==='AGEN'?(data.agentStatus==='MENUNGGU_PERSETUJUAN'?'Pengajuan reseller tercatat menunggu persetujuan admin.':'Pesanan tercatat.'):'Pesanan tercatat. Simpan nomor pesanan untuk referensi.';
 const t=data.totals||{};$('#orderRecap').innerHTML=`<div class="srow"><span>Jenis pelanggan</span><span>${type==='AGEN'?'Pengajuan reseller':'Eceran'}</span></div><div class="srow"><span>Pengambilan</span><span>${co.delivery==='AMBIL'?'Ambil di toko':'Antar lokal — '+safeText(co.zone)}</span></div><div class="srow"><span>Pembayaran</span><span>${PAY[co.pay].label}</span></div><div class="srow"><span>Total</span><span>${idr(Number(t.total)||0)}</span></div>`;
 localStorage.setItem('cuby_customer',JSON.stringify({name,wa}));cart.clear();save();renderCart();updateBadge();showView('done');toast('Pesanan berhasil dicatat');
 }catch(err){console.error(err);toast(err.message||'Pesanan gagal. Periksa koneksi dan Apps Script.',false);}finally{if(btn){btn.disabled=false;btn.textContent=btn.dataset.oldText||'Konfirmasi Pesanan';}}
});

// Sinkronisasi produk dari Google Sheets. Jika API belum berisi produk, katalog lokal tetap dipakai.
async function loadProductsFromSheet(){
  window.CUBY_STATE=window.CUBY_STATE||{}; window.CUBY_STATE.products='katalog lokal (fallback)';
  if(!STORE_CONFIG.apiUrl || !/^https:\/\/script\.google\.com\/.+\/exec$/.test(STORE_CONFIG.apiUrl)){ console.error('[Cuby] apiUrl di js/config.js belum valid:',STORE_CONFIG.apiUrl); toast('URL API belum diatur — memakai katalog contoh',false); return; }
  try{
    const r=await fetch(STORE_CONFIG.apiUrl+'?action=products',{cache:'no-store'}); const d=await r.json();
    if(!d.ok){ console.error('[Cuby] API produk error:',d.error); toast('Gagal memuat produk dari Sheets: '+(d.error||'tidak diketahui')+' — memakai katalog contoh',false); return; }
    if(!Array.isArray(d.products) || !d.products.length){ console.warn('[Cuby] Sheet PRODUK kosong — memakai katalog lokal. Checkout akan gagal karena ID produk lokal tidak ada di Sheets.'); toast('Sheet PRODUK masih kosong — memakai katalog contoh',false); return; }
    window.CUBY_STATE.products='Google Sheets ('+d.products.length+' produk)';
    d.products.forEach(x=>{ if(x.specs && !Array.isArray(x.specs)) x.specs=String(x.specs).split('||').filter(Boolean); });
    PRODUCTS.splice(0,PRODUCTS.length,...d.products);
    [...cart.keys()].forEach(id=>{ if(!byId(id)) cart.delete(id); }); save(); renderCart(); updateBadge();
    renderCats(); renderGrid(); renderSpot(); renderHero();
    toast('Produk tersinkron dari Google Sheets');
  }catch(err){ console.warn('Produk Google Sheets belum tersedia; memakai data lokal.',err); toast('Tidak bisa terhubung ke Apps Script — memakai katalog contoh',false); }
  if(window.cubyPaintDebug)cubyPaintDebug();
}


/* drawer buka/tutup */
function openCart(){$('#drawer').classList.add('open');$('#scrim').classList.add('on');document.documentElement.classList.add('lock')}
function closeCart(){
  $('#drawer').classList.remove('open');$('#scrim').classList.remove('on');document.documentElement.classList.remove('lock');
  setTimeout(()=>showView('cart'),420);
}
 $('#cartBtn').onclick=openCart;
 $('#closeCart').onclick=closeCart;
 $('#checkoutBtn').onclick=()=>{
  if(!cart.size){toast('Keranjang masih kosong',false);return}
  try{const a=JSON.parse(localStorage.getItem('cuby_customer')||'null');
    if(a){$('#agName').value=a.name||'';$('#agWa').value=a.wa||''}
  }catch(_){}
  renderCheckout(); showView('checkout');
};
 $('#doneBtn').onclick=closeCart;

/* ================= KATALOG ================= */
let curFilter='SEMUA', curQ='';
let CATS=[];
const inCat=(p,c)=>c==='SEMUA'||(c==='UNGGULAN'?!!p.unggulan:p.cat===c);
function renderCats(){
  CATS=['SEMUA',...(PRODUCTS.some(p=>p.unggulan)?['UNGGULAN']:[]),...new Set(PRODUCTS.map(p=>p.cat))];
  if(!CATS.includes(curFilter))curFilter='SEMUA';
  $('#cats').innerHTML=CATS.map(c=>{
    const n=PRODUCTS.filter(p=>inCat(p,c)).length;
    return `<button class="fbtn${c===curFilter?' on':''}" data-cat="${c}">${c}<span class="cnt">${n}</span></button>`;
  }).join('');
}
 $('#cats').addEventListener('click',e=>{
  const b=e.target.closest('.fbtn'); if(!b)return;
  curFilter=b.dataset.cat; renderCats(); renderGrid();
});
function setQuery(q){
  curQ=q.trim().toLowerCase();
  $('#search').value=q; $('#hInput').value=q;
  renderGrid();
}
 $('#search').addEventListener('input',e=>{curQ=e.target.value.trim().toLowerCase();renderGrid()});
 $('#hInput').addEventListener('input',e=>{curQ=e.target.value.trim().toLowerCase();$('#search').value=e.target.value;renderGrid()});
 $('#hSearch').addEventListener('submit',e=>{
  e.preventDefault();
  setQuery($('#hInput').value);
  document.getElementById('katalog').scrollIntoView({behavior:'smooth'});
});

const badgeCls=b=>b==='LARIS'?'b-hot':b==='BARU'?'b-new':'b-disc';
const cellHTML=(p,i)=>`
<article class="pcard" data-id="${p.id}" style="animation-delay:${i*30}ms">
  <div class="pimg">
    ${p.badge?`<span class="badge ${badgeCls(p.badge)}">${p.badge}</span>`:''}
    ${art(p)}
    <button class="qadd" data-add="${p.id}" aria-label="Tambah ${p.name} ke keranjang"><i data-lucide="plus" class="ic"></i></button>
  </div>
  <div class="pbody">
    <p class="pcat">${p.cat}</p>
    <h3>${p.name}</h3>
    <div class="pprice">${p.old?`<s>${idr(p.old)}</s>`:''}<b>${idr(p.price)}</b></div>
    ${Number(p.hargaGrosir)>0&&Number(p.minQtyGrosir)>0?`<p class="pgros">Grosir ${idr(p.hargaGrosir)} · min ${p.minQtyGrosir}</p>`:''}
    <div class="pmeta"><i data-lucide="star" class="ic star"></i><b>${p.rating}</b><span>· ${p.sold} terjual</span></div>
    <p class="ploc"><i data-lucide="map-pin" class="ic"></i>${esc(SETTINGS.store.location)}</p>
  </div>
</article>`;

function renderGrid(){
  const list=PRODUCTS.filter(p=>inCat(p,curFilter)&&(!curQ||(p.name+' '+p.cat).toLowerCase().includes(curQ)));
  $('#grid').innerHTML=list.length
    ? list.map(cellHTML).join('')
    : `<div class="gempty"><i data-lucide="search-x" class="ic"></i><p><b>Produk tidak ditemukan</b></p><span>Coba kata kunci lain</span></div>`;
  $('#gridCount').textContent=`Menampilkan ${list.length} dari ${PRODUCTS.length} produk`;
  icons();
}
 $('#grid').addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');
  if(add){addToCart(add.dataset.add);add.classList.remove('bump');void add.offsetWidth;add.classList.add('bump');return}
  const card=e.target.closest('.pcard');
  if(card)openQV(card.dataset.id);
});

/* ================= QUICK VIEW ================= */
let qvId=null,qvQty=1;
function openQV(id){
  const p=byId(id); qvId=id; qvQty=1;
  $('#qvArt').innerHTML=art(p);
  $('#qvNo').textContent='/'+p.no;
  $('#qvCat').textContent=p.cat+' /'+p.no;
  $('#qvName').textContent=p.name;
  $('#qvPrice').innerHTML=(p.old?`<s>${idr(p.old)}</s>`:'')+idr(p.price);
  $('#qvRate').textContent=p.rating;
  $('#qvSold').textContent=`· ${p.sold} terjual`+(p.berat?` · ${p.berat} g`:'');
  $('#qvTag').textContent=p.tag;
  $('#qvDesc').textContent=p.desc||'';
  $('#qvSpecs').innerHTML=p.specs.map((s,i)=>`<li><b>${String(i+1).padStart(2,'0')}</b>${s}</li>`).join('');
  $('#qvQty').textContent=1;
  $('#qv').classList.add('open');$('#scrim').classList.add('on');
  document.documentElement.classList.add('lock'); icons();
}
function closeQV(){$('#qv').classList.remove('open');$('#scrim').classList.remove('on');document.documentElement.classList.remove('lock')}
 $('#qvClose').onclick=closeQV;
 $('#qvInc').onclick=()=>{$('#qvQty').textContent=++qvQty};
 $('#qvDec').onclick=()=>{if(qvQty>1)$('#qvQty').textContent=--qvQty};
 $('#qvAdd').onclick=()=>{addToCart(qvId,qvQty);closeQV();openCart()};
 const spotP=()=>{const id=SETTINGS.spot&&SETTINGS.spot.id;return (id&&byId(id))||PRODUCTS.find(p=>p.unggulan)||byId('p1')||PRODUCTS[0]};
function renderSpot(){const p=spotP();if(!p)return;
  $('#spCat').textContent=p.cat+' / '+(p.no||'');$('#spName').textContent=p.name;
  $('#spDesc').textContent=p.desc||p.tag||'';
  $('#spSpecs').innerHTML=(p.specs||[]).map((s,i)=>`<li><b>${String(i+1).padStart(2,'0')}</b>${esc(s)}</li>`).join('');
  $('#spStock').innerHTML='<span class="pdot"></span>'+(p.stok===0?'Stok habis':p.stok>0?`Stok tersedia ${p.stok} unit — siap kirim hari ini`:'Stok tersedia — siap kirim hari ini');
  $('#spPrice').innerHTML='<b>'+idr(p.price)+'</b>';
  const sv=$('#tiltCard'),sw=$('.swrow'),ab=$('#spotAdd');
  sv.querySelector('use').setAttribute('href',p.art?'#'+p.art:'');sv.style.display=p.art?'':'none';
  if(sw)sw.style.display=(p.art&&!p.img)?'':'none';
  if(ab){ab.disabled=p.stok===0;ab.style.opacity=p.stok===0?'.5':''}
  const z=$('#tiltZone');z.style.position='relative';z.style.minHeight='280px';const o=z.querySelector('img.simg');if(o)o.remove();
  if(p.img)z.insertAdjacentHTML('beforeend',`<img class="simg" src="${esc(p.img)}" alt="${esc(p.name)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="this.remove()">`);}
 $('#spotAdd').onclick=()=>{addToCart(spotP().id);openCart()};
 $('#spotMore').onclick=()=>openQV(spotP().id);

 $('#scrim').onclick=()=>{closeCart();closeQV()};
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeCart();closeQV();$('#mnav').classList.remove('open');document.documentElement.classList.remove('lock')}
});

/* varian warna spotlight */
 $$('.swatch').forEach(s=>s.onclick=()=>{
  $$('.swatch').forEach(x=>x.classList.remove('on')); s.classList.add('on');
  $('#tiltCard').style.setProperty('--acc',s.dataset.c);
  $('#varName').textContent=s.dataset.n;
});

/* FAQ */
 $('.faqwrap').addEventListener('click',e=>{const h=e.target.closest('.qa-h');if(!h)return;const qa=h.parentElement,open=qa.classList.contains('open');$$('.qa').forEach(x=>x.classList.remove('open'));if(!open)qa.classList.add('open')});

/* newsletter + link demo */
 $('#nlForm').addEventListener('submit',e=>{
  e.preventDefault();
  const v=$('#nlEmail').value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){toast('Alamat email tidak valid',false);return}
  toast(`Berhasil — notifikasi dikirim ke ${v}`);
  $('#nlEmail').value='';
});
 $$('[data-soon]').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault(); toast(`${a.dataset.soon} — segera hadir`);
}));

/* menu mobile */
 $('#menuBtn').onclick=()=>{$('#mnav').classList.add('open');document.documentElement.classList.add('lock')};
const closeMenu=()=>{$('#mnav').classList.remove('open');document.documentElement.classList.remove('lock')};
 $('#menuClose').onclick=closeMenu;
 $$('#mnav a.big').forEach(a=>a.addEventListener('click',closeMenu));

/* ================= MARQUEE ================= */


/* ================= JAM ================= */
const fmt=new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
loadProductsFromSheet();

function tick(){$$('.jsClock').forEach(c=>c.textContent=fmt.format(new Date())+' WIB')}
tick(); setInterval(tick,1000);

/* ================= REVEAL ================= */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
}),{threshold:.1});
 $$('[data-reveal]').forEach(el=>io.observe(el));

/* ================= FOTO HERO ================= */
function heroPick(){
  const ids=(SETTINGS.hero&&SETTINGS.hero.ids)||[],used=new Set(),out=[];
  [0,1,2].forEach(i=>{const p=ids[i]&&byId(ids[i]);if(p&&!used.has(p.id)){out[i]=p;used.add(p.id)}});
  const pool=[...PRODUCTS.filter(p=>p.hot&&p.img),...PRODUCTS.filter(p=>p.img),...PRODUCTS];
  [0,1,2].forEach(i=>{if(out[i])return;const p=pool.find(x=>!used.has(x.id));if(p){out[i]=p;used.add(p.id)}});
  return out;
}
function renderHero(){
  const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const list=heroPick();
  ['#hf1','#hf2','#hf3'].forEach((sel,i)=>{
    const el=$(sel),p=list[i];if(!el)return;
    if(!p){el.style.display='none';return}
    el.style.display='';
    el.innerHTML=`${art(p)}<div class="htag"><b>${E(p.name)}</b><span>${idr(p.price)}</span></div>`;
    const im=el.querySelector('img');if(im)im.onerror=()=>{im.remove()};
  });
}

/* ================= INIT ================= */
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function cartKg(){let g=0;cart.forEach((q,id)=>{const p=byId(id);if(p)g+=(Number(p.berat)||0)*q});return Math.max(1,Math.ceil(g/1000))}

function fillTxt(t){const S=SETTINGS,W=S.warranty;return String(t||'').replace(/\{garansi\}/g,W.months).replace(/\{uji\}/g,W.testHours).replace(/\{retur\}/g,W.returnDays).replace(/\{freeMin\}/g,idr(FREE_MIN)).replace(/\{lokasi\}/g,S.store.location)}
function renderMarquee(){const items=['REMPAH & SEMBAKO LENGKAP','HARGA GROSIR OTOMATIS','ANTAR SELURUH KOTA SEMARANG','GRATIS ONGKIR ZONA 1 & 2','TUNAI ATAU TRANSFER'];$('#marqTrack').innerHTML=items.map(t=>`<span>${t}</span><span class="mdot"></span>`).join('').repeat(6)}
function applySettings(){
  const S=SETTINGS,W=S.warranty||{months:0,testHours:0};
  LOCAL_ZONES=(S.shipping&&S.shipping.localZones)||LOCAL_ZONES;
  const T=(sel,txt)=>{const el=$(sel);if(el)el.textContent=txt};
  $$('.jsLoc').forEach(e=>e.textContent=S.store?.location||'');
  T('#heroSub',S.text?.heroSub||'Kebutuhan sembako harian dengan pilihan ambil di toko atau antar lokal.');
  T('#tWar','Harga dan stok dikonfirmasi saat pesanan');T('#qvWar','Kebutuhan harian');T('#qvTest','');
  const a=[S.store?.location,S.store?.address].filter(Boolean).join(' · '), ft=$('#ftLoc');
  if(ft)ft.innerHTML=/^https?:\/\//.test(S.store?.mapsUrl||'')?`<a href="${esc(S.store.mapsUrl)}" target="_blank" rel="noopener">${esc(a)}</a>`:esc(a);
  const shipTable=$('#shipTable');
  if(shipTable)shipTable.innerHTML=`<div class="shrow head" style="grid-template-columns:1fr 1fr"><div>Kecamatan tujuan (Kota Semarang)</div><div>Tarif</div></div>`+Object.entries(LOCAL_ZONES).map(([z,v])=>`<div class="shrow" style="grid-template-columns:1fr 1fr"><div>${esc(z)}</div><div><b>${idr(Number(v)||0)}</b></div></div>`).join('');
  const note=$('.conote');if(note)note.textContent='Ambil di toko tanpa ongkir. Ongkir antar mengikuti kecamatan tujuan; gratis ongkir berlaku di zona dan minimal belanja tertentu.';
  if(S.faq&&S.faq.length){const fw=$('.faqwrap');if(fw)fw.innerHTML=S.faq.map(f=>`<div class="qa"><button class="qa-h"><span>${esc(fillTxt(f.q))}</span><i data-lucide="plus" class="ic"></i></button><div class="qa-b"><div class="qa-i"><p>${esc(fillTxt(f.a))}</p></div></div></div>`).join('');}
  renderMarquee();renderGrid();renderSpot();renderHero();renderCart();if(view==='checkout')renderCheckout();icons();
}
function mergeStoreSettings(o){
  if(!o||typeof o!=='object')return;
  const copy=JSON.parse(JSON.stringify(o));
  // Pengaturan pengiriman toko menggunakan zona lokal; metode ekspedisi lama tidak digunakan checkout.
  if(copy.text&&/darat|laut|udara|charger|keyboard|speaker|cctv|ekspedisi pilihan|gratis ongkir via jne/i.test(String(copy.text.heroSub||''))) delete copy.text.heroSub;
  if(copy.store&&/makassar|sulawesi selatan/i.test(String(copy.store.location||''))) delete copy.store.location;
  if(Array.isArray(copy.faq)&&copy.faq.some(f=>/darat|laut|udara|cicilan|dp 30|gratis ongkir via jne|ekspedisi pilihan|garansi resmi distributor|limit rp/i.test(String(f.q||'')+' '+String(f.a||'')))) delete copy.faq;
  mergeSettings(copy);
}
async function loadSettings(){
  try{const c=localStorage.getItem('cm_settings');if(c)mergeStoreSettings(JSON.parse(c))}catch(_){}
  applySettings();
  try{const d=await fetch(STORE_CONFIG.apiUrl+'?action=settings',{cache:'no-store'}).then(r=>r.json());
    if(d.ok&&d.settings&&Object.keys(d.settings).length){mergeStoreSettings(d.settings);localStorage.setItem('cm_settings',JSON.stringify(d.settings));applySettings()}}
  catch(e){console.warn('Pengaturan online belum tersedia; memakai bawaan.',e)}
}
renderCats(); renderGrid(); renderCart(); updateBadge(); showView('cart'); renderSpot(); renderHero(); loadSettings(); icons();
