const PORTAL = document.body.dataset.portal || 'desa';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="assets/images/icons.svg#i-${name}"></use></svg>`;
const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const LETTER_TYPES = [
  { name: 'Surat Permohonan', icon: 'mail', color: 'green', desc: 'Pengajuan permohonan resmi warga kepada pihak kecamatan.' },
  { name: 'Surat Keputusan', icon: 'shield', color: 'blue', desc: 'Naskah keputusan resmi yang diterbitkan pemerintah desa.' },
  { name: 'Surat Kuasa', icon: 'users', color: 'purple', desc: 'Pemberian kuasa untuk mewakili urusan administrasi.' },
  { name: 'Surat Perintah', icon: 'send', color: 'red', desc: 'Perintah tugas atau pelaksanaan kegiatan tertentu.' },
  { name: 'Surat Edaran', icon: 'copy', color: 'yellow', desc: 'Penyampaian informasi resmi kepada pihak terkait.' },
  { name: 'Surat Undangan', icon: 'calendar', color: 'orange', desc: 'Undangan kegiatan, rapat, atau pertemuan resmi.' },
  { name: 'Surat Keterangan', icon: 'file', color: 'cyan', desc: 'Keterangan domisili, usaha, dan kebutuhan warga lainnya.' }
];

const seedResidents = [
  { nik:'7305061205890001', name:'Muh. Akbar', gender:'Laki-laki', birth:'Takalar, 12 Mei 1989', address:'Dusun Barugaya, RT 001/RW 002', status:'Kepala Keluarga' },
  { nik:'7305064506920003', name:'Nur Aisyah', gender:'Perempuan', birth:'Takalar, 5 Juni 1992', address:'Dusun Barugaya, RT 002/RW 002', status:'Istri' },
  { nik:'7305060301750002', name:'H. Jamaluddin', gender:'Laki-laki', birth:'Gowa, 3 Januari 1975', address:'Dusun Panaikang, RT 001/RW 003', status:'Kepala Keluarga' },
  { nik:'7305065110950004', name:'Sri Wahyuni', gender:'Perempuan', birth:'Takalar, 11 Oktober 1995', address:'Dusun Panaikang, RT 003/RW 003', status:'Kepala Keluarga' },
  { nik:'7305061808820005', name:'Baharuddin', gender:'Laki-laki', birth:'Jeneponto, 18 Agustus 1982', address:'Dusun Bontomanai, RT 001/RW 004', status:'Kepala Keluarga' },
  { nik:'7305066712000007', name:'Nurul Hikmah', gender:'Perempuan', birth:'Takalar, 27 Desember 2000', address:'Dusun Bontomanai, RT 002/RW 004', status:'Anak' },
  { nik:'7305061404870008', name:'Andi Fadli', gender:'Laki-laki', birth:'Makassar, 14 April 1987', address:'Dusun Barugaya, RT 004/RW 002', status:'Kepala Keluarga' },
  { nik:'7305064909780009', name:'Hj. Rosmiati', gender:'Perempuan', birth:'Takalar, 9 Juli 1978', address:'Dusun Panaikang, RT 002/RW 003', status:'Kepala Keluarga' },
  { nik:'7305061212840010', name:'Muhammad Yusuf', gender:'Laki-laki', birth:'Takalar, 12 Desember 1984', address:'Dusun Barugaya, RT 001/RW 002', status:'Anak' },
  { nik:'7305065703910011', name:'Fitriani', gender:'Perempuan', birth:'Takalar, 17 Maret 1991', address:'Dusun Bontomanai, RT 003/RW 004', status:'Istri' },
  { nik:'7305062909860012', name:'Dg. Naba', gender:'Laki-laki', birth:'Jeneponto, 29 September 1986', address:'Dusun Panaikang, RT 004/RW 003', status:'Kepala Keluarga' },
  { nik:'7305066105940013', name:'Wahyuddin', gender:'Laki-laki', birth:'Takalar, 6 Januari 1994', address:'Dusun Barugaya, RT 003/RW 002', status:'Kepala Keluarga' },
  { nik:'7305064208880014', name:'Hasnawati', gender:'Perempuan', birth:'Gowa, 4 Februari 1988', address:'Dusun Bontomanai, RT 001/RW 004', status:'Istri' },
  { nik:'7305061510990015', name:'Muh. Iqbal', gender:'Laki-laki', birth:'Takalar, 15 Oktober 1999', address:'Dusun Panaikang, RT 002/RW 003', status:'Anak' },
  { nik:'7305065011820016', name:'Hj. Nurbaya', gender:'Perempuan', birth:'Takalar, 10 November 1982', address:'Dusun Barugaya, RT 002/RW 002', status:'Kepala Keluarga' },
  { nik:'7305062306930017', name:'Aswar Hamzah', gender:'Laki-laki', birth:'Takalar, 23 Juni 1993', address:'Dusun Bontomanai, RT 004/RW 004', status:'Kepala Keluarga' },
  { nik:'7305066708770018', name:'Marwah', gender:'Perempuan', birth:'Jeneponto, 7 Agustus 1977', address:'Dusun Panaikang, RT 001/RW 003', status:'Istri' },
  { nik:'7305061904890019', name:'Syamsul Bahri', gender:'Laki-laki', birth:'Takalar, 19 April 1989', address:'Dusun Barugaya, RT 004/RW 002', status:'Kepala Keluarga' },
  { nik:'7305064102010020', name:'Nurul Ainun', gender:'Perempuan', birth:'Takalar, 1 Februari 2001', address:'Dusun Bontomanai, RT 002/RW 004', status:'Anak' },
  { nik:'7305061708850021', name:'Abd. Latif', gender:'Laki-laki', birth:'Makassar, 17 Agustus 1985', address:'Dusun Panaikang, RT 003/RW 003', status:'Kepala Keluarga' },
  { nik:'7305065304920022', name:'Hasmawati', gender:'Perempuan', birth:'Takalar, 3 April 1992', address:'Dusun Barugaya, RT 001/RW 002', status:'Istri' },
  { nik:'7305062012870023', name:'Muh. Nur', gender:'Laki-laki', birth:'Takalar, 20 Desember 1987', address:'Dusun Bontomanai, RT 003/RW 004', status:'Kepala Keluarga' },
  { nik:'7305066511950024', name:'Andi Sartika', gender:'Perempuan', birth:'Gowa, 25 November 1995', address:'Dusun Panaikang, RT 002/RW 003', status:'Kepala Keluarga' },
  { nik:'7305061309830025', name:'Rusdi', gender:'Laki-laki', birth:'Takalar, 13 September 1983', address:'Dusun Barugaya, RT 003/RW 002', status:'Kepala Keluarga' },
  { nik:'7305064805980026', name:'Suriani', gender:'Perempuan', birth:'Takalar, 8 Mei 1998', address:'Dusun Bontomanai, RT 001/RW 004', status:'Anak' },
  { nik:'7305062702910027', name:'Baso Amir', gender:'Laki-laki', birth:'Jeneponto, 27 Februari 1991', address:'Dusun Panaikang, RT 004/RW 003', status:'Kepala Keluarga' },
  { nik:'7305065609860028', name:'Hj. Kartini', gender:'Perempuan', birth:'Takalar, 6 September 1986', address:'Dusun Barugaya, RT 002/RW 002', status:'Istri' },
  { nik:'7305061106920029', name:'Ilham Saputra', gender:'Laki-laki', birth:'Takalar, 11 Juni 1992', address:'Dusun Bontomanai, RT 004/RW 004', status:'Kepala Keluarga' },
  { nik:'7305064410000030', name:'Riska Amalia', gender:'Perempuan', birth:'Takalar, 4 Oktober 2000', address:'Dusun Panaikang, RT 001/RW 003', status:'Anak' },
  { nik:'7305061807890031', name:'Herman', gender:'Laki-laki', birth:'Makassar, 18 Juli 1989', address:'Dusun Barugaya, RT 004/RW 002', status:'Kepala Keluarga' },
  { nik:'7305065002940032', name:'Nurjannah', gender:'Perempuan', birth:'Takalar, 2 Desember 1994', address:'Dusun Bontomanai, RT 002/RW 004', status:'Istri' }
];

const seedLetters = [
  { id:'SRT-0826-031', number:'140/031/DB/VIII/2026', type:'Surat Permohonan', citizen:'Muh. Akbar', nik:'7305061205890001', village:'Desa Barugaya', purpose:'Permohonan rekomendasi izin usaha', date:'12 Agu 2026', status:'Terkirim', reason:'Menunggu pemeriksaan kelengkapan oleh petugas kecamatan.', updated:'12 Agu 2026, 14:32' },
  { id:'SRT-0826-030', number:'470/030/DB/VIII/2026', type:'Surat Keterangan', citizen:'Nur Aisyah', nik:'7305064506920003', village:'Desa Barugaya', purpose:'Keterangan domisili untuk administrasi bank', date:'11 Agu 2026', status:'Diterima', reason:'Berkas telah diterima dan masuk antrean peninjauan.', updated:'12 Agu 2026, 09:15' },
  { id:'SRT-0826-028', number:'005/028/DB/VIII/2026', type:'Surat Undangan', citizen:'H. Jamaluddin', nik:'7305060301750002', village:'Desa Barugaya', purpose:'Undangan musyawarah tingkat kecamatan', date:'10 Agu 2026', status:'Disetujui', reason:'Dokumen valid. Surat telah dicetak dan siap diambil di loket kecamatan.', updated:'11 Agu 2026, 13:40' },
  { id:'SRT-0826-025', number:'145/025/DB/VIII/2026', type:'Surat Kuasa', citizen:'Sri Wahyuni', nik:'7305065110950004', village:'Desa Barugaya', purpose:'Kuasa pengurusan dokumen pertanahan', date:'8 Agu 2026', status:'Ditolak', reason:'Salinan identitas penerima kuasa belum dilampirkan. Silakan lengkapi lalu ajukan kembali.', updated:'9 Agu 2026, 10:20' },
  { id:'SRT-0826-022', number:'140/022/DB/VIII/2026', type:'Surat Permohonan', citizen:'Baharuddin', nik:'7305061808820005', village:'Desa Barugaya', purpose:'Permohonan bantuan sarana pertanian', date:'6 Agu 2026', status:'Disetujui', reason:'Usulan sesuai hasil verifikasi dan surat siap ditandatangani.', updated:'7 Agu 2026, 15:05' },
  { id:'SRT-0826-019', number:'100/019/DB/VIII/2026', type:'Surat Keputusan', citizen:'Andi Fadli', nik:'7305061404870008', village:'Desa Barugaya', purpose:'Penetapan pengurus kelompok tani', date:'4 Agu 2026', status:'Diterima', reason:'Dokumen diterima, menunggu verifikasi pejabat terkait.', updated:'5 Agu 2026, 08:55' },
  { id:'SRT-0726-117', number:'003/117/DB/VII/2026', type:'Surat Edaran', citizen:'Hj. Rosmiati', nik:'7305064909780009', village:'Desa Barugaya', purpose:'Edaran kerja bakti lingkungan', date:'29 Jul 2026', status:'Disetujui', reason:'Naskah telah sesuai dan disetujui untuk diterbitkan.', updated:'30 Jul 2026, 11:15' }
];

const seedVillages = [
  { name:'Desa Barugaya', district:'Kec. Polongbangkeng Timur', residents:1284, incoming:8, admin:'Rahmat Hidayat', user:'barugaya', phone:'0821 4455 9021', active:'2 menit lalu', status:'Aktif' },
  { name:'Desa Kampung Beru', district:'Kec. Polongbangkeng Timur', residents:1645, incoming:12, admin:'Nur Khaerunnisa', user:'kampungberu', phone:'0852 9912 4053', active:'8 menit lalu', status:'Aktif' },
  { name:'Desa Ko’mara', district:'Kec. Polongbangkeng Timur', residents:2110, incoming:5, admin:'Hasan Basri', user:'komara', phone:'0813 5519 0032', active:'21 menit lalu', status:'Aktif' },
  { name:'Desa Massamaturu', district:'Kec. Polongbangkeng Timur', residents:1892, incoming:9, admin:'Andi Syahrir', user:'massamaturu', phone:'0823 4637 8110', active:'35 menit lalu', status:'Aktif' },
  { name:'Desa Parang Baddo', district:'Kec. Polongbangkeng Timur', residents:2036, incoming:3, admin:'Muh. Ilyas', user:'parangbaddo', phone:'0853 9990 7124', active:'1 jam lalu', status:'Aktif' },
  { name:'Desa Timbuseng', district:'Kec. Polongbangkeng Timur', residents:1478, incoming:7, admin:'Syarifuddin', user:'timbuseng', phone:'0812 8033 1187', active:'1 jam lalu', status:'Aktif' },
  { name:'Desa Kale Ko’mara', district:'Kec. Polongbangkeng Timur', residents:1159, incoming:2, admin:'Ruslan Dg. Naba', user:'kalekomara', phone:'0852 4306 1501', active:'3 jam lalu', status:'Nonaktif' },
  { name:'Desa Balangtanaya', district:'Kec. Polongbangkeng Timur', residents:1236, incoming:4, admin:'Sri Rahayu', user:'balangtanaya', phone:'0813 6781 3220', active:'Kemarin', status:'Aktif' }
];

const otherIncoming = [
  { id:'SRT-0826-044', number:'140/044/BT/VIII/2026', type:'Surat Permohonan', citizen:'Sitti Aminah', nik:'7305065301900007', village:'Desa Kampung Beru', purpose:'Permohonan rekomendasi bantuan UMKM', date:'13 Agu 2026', status:'Terkirim', reason:'Menunggu pemeriksaan awal oleh petugas kecamatan.', updated:'13 Agu 2026, 09:42' },
  { id:'SRT-0826-043', number:'470/043/PL/VIII/2026', type:'Surat Keterangan', citizen:'M. Ridwan', nik:'7305061911830004', village:'Desa Ko’mara', purpose:'Keterangan usaha perdagangan', date:'13 Agu 2026', status:'Terkirim', reason:'Menunggu pemeriksaan awal oleh petugas kecamatan.', updated:'13 Agu 2026, 08:55' },
  { id:'SRT-0826-041', number:'005/041/AT/VIII/2026', type:'Surat Undangan', citizen:'Darmawati', nik:'7305064809880002', village:'Desa Massamaturu', purpose:'Undangan rapat koordinasi stunting', date:'12 Agu 2026', status:'Diterima', reason:'Berkas diterima petugas dan sedang ditinjau.', updated:'12 Agu 2026, 16:15' },
  { id:'SRT-0826-039', number:'145/039/TM/VIII/2026', type:'Surat Kuasa', citizen:'H. Sahabuddin', nik:'7305060402700001', village:'Desa Parang Baddo', purpose:'Kuasa pengambilan bantuan sosial', date:'12 Agu 2026', status:'Terkirim', reason:'Menunggu pemeriksaan awal oleh petugas kecamatan.', updated:'12 Agu 2026, 13:02' },
  { id:'SRT-0826-037', number:'100/037/BD/VIII/2026', type:'Surat Keputusan', citizen:'Nurhayati', nik:'7305066207850005', village:'Desa Timbuseng', purpose:'Penetapan kader posyandu', date:'11 Agu 2026', status:'Disetujui', reason:'Data telah diverifikasi. Dokumen siap dicetak dan ditandatangani.', updated:'12 Agu 2026, 10:10' },
  { id:'SRT-0826-035', number:'003/035/PP/VIII/2026', type:'Surat Edaran', citizen:'Abdul Rahman', nik:'7305062106810006', village:'Desa Kale Ko’mara', purpose:'Edaran kebersihan saluran air', date:'10 Agu 2026', status:'Ditolak', reason:'Tujuan surat perlu diperjelas dan daftar penerima belum dicantumkan.', updated:'11 Agu 2026, 09:20' }
];

const defaultTemplate = type => `PEMERINTAH KABUPATEN TAKALAR\nKECAMATAN POLONGBANGKENG TIMUR\nDESA BARUGAYA\nAlamat: Jl. Poros Polongbangkeng Timur, Kabupaten Takalar\n\n${type.toUpperCase()}\nNomor: {{nomor_surat}}\n\nYang bertanda tangan di bawah ini, Pemerintah Desa Barugaya, menerangkan bahwa:\n\nNama            : {{nama_warga}}\nNIK             : {{nik}}\nTempat/Tgl Lahir: {{tempat_tanggal_lahir}}\nAlamat          : {{alamat}}\n\nDengan ini menerangkan bahwa surat ini dibuat untuk keperluan {{keperluan}} dan ditujukan kepada Pemerintah Kecamatan.\n\nDemikian surat ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.\n\nBarugaya, {{tanggal}}\nKepala Desa Barugaya\n\n\n\n(____________________)`;

const stored = (() => { try { return JSON.parse(localStorage.getItem('lapoltimData') || '{}'); } catch { return {}; } })();
const state = {
  role: null,
  page: 'dashboard',
  mobileOpen: false,
  statusFilter: 'Semua',
  statusMonth: '',
  letterFilter: 'Semua',
  villageFilter: '',
  residentSearch: '',
  residentDusun: '',
  residentGender: '',
  historyStatusFilter: '',
  historyVillageFilter: '',
  historyMonth: '',
  villageSearch: '',
  villageStatusFilter: '',
  accountSearch: '',
  accountStatusFilter: '',
  pagination: {},
  camatPassword: stored.camatPassword || 'polbangtimurcepat',
  letters: stored.letters || seedLetters,
  incoming: stored.incoming || [...otherIncoming, ...seedLetters],
  residents: stored.residents || seedResidents,
  villages: stored.villages || seedVillages,
  accounts: stored.accounts || seedVillages.map((v,i) => ({...v, password:i===0?'desa123':'Takalar@2026', status:v.status||'Aktif', created: i < 4 ? '12 Jan 2026' : '18 Mar 2026'})),
  templates: stored.templates || Object.fromEntries(LETTER_TYPES.map(t => [t.name, { content: defaultTemplate(t.name), edited:'10 Agu 2026, 09:30' }])),
  currentVillage: 'Desa Barugaya'
};

function persist() {
  localStorage.setItem('lapoltimData', JSON.stringify({
    letters: state.letters, incoming: state.incoming, residents: state.residents,
    villages: state.villages,
    accounts: state.accounts, templates: state.templates, camatPassword: state.camatPassword
  }));
}

function toast(title, message, type='success') {
  const root = $('#toast-root');
  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'error' : ''}`;
  el.innerHTML = `<div class="toast-icon">${icon(type === 'error' ? 'x' : 'check', 'sm')}</div><div><strong>${esc(title)}</strong><p>${esc(message)}</p></div>`;
  root.appendChild(el);
  setTimeout(() => { el.style.opacity='0'; el.style.transform='translateX(12px)'; setTimeout(()=>el.remove(),220); }, 3300);
}

// Markup login & shell sudah statis di desa.html / camat.html.
// Di sini JS cuma menentukan mana yang tampil.
function showView(view) {
  $('#login-view').style.display = view === 'login' ? '' : 'none';
  $('#app-view').style.display = view === 'app' ? '' : 'none';
}

const pageTitles = { dashboard:'Beranda', inventory:'Inventaris Surat', residents:'Data Warga', status:'Status Surat', templates:'Template Surat', history:'Riwayat', incoming:'Surat Masuk', villages:'Daftar Desa', accounts:'Akun Desa' };

// Sidebar & topbar sudah statis di desa.html / camat.html (masing-masing
// file cuma punya 1 role, jadi nggak perlu digenerate dari JS). Di sini JS
// cuma mengubah bagian yang benar-benar dinamis: menu aktif, judul halaman,
// dan buka/tutup sidebar mobile.
function updateShellState() {
  $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === state.page));
  const crumbStrong = $('.page-crumb strong');
  if (crumbStrong) crumbStrong.textContent = pageTitles[state.page];
  const overlay = $('.mobile-overlay');
  const sidebar = $('.sidebar');
  if (overlay) overlay.style.display = state.mobileOpen ? 'block' : 'none';
  if (sidebar) sidebar.classList.toggle('open', state.mobileOpen);
}

// Ganti isi #content-area sambil menjaga fokus & posisi kursor input yang
// sedang aktif (mis. saat mengetik di kolom pencarian), supaya re-render
// nggak melempar fokus keluar dari input.
function setContent(html) {
  const area = $('#content-area');
  if (!area) return;
  const active = document.activeElement;
  let focusInfo = null;
  if (active && area.contains(active) && active.id) {
    focusInfo = { id: active.id, start: active.selectionStart, end: active.selectionEnd };
  }
  area.classList.remove('content-enter');
  area.innerHTML = html;
  // Trigger transisi halus setiap kali konten halaman berganti.
  void area.offsetWidth;
  area.classList.add('content-enter');
  if (focusInfo) {
    const el = document.getElementById(focusInfo.id);
    if (el) {
      el.focus();
      if (typeof focusInfo.start === 'number' && el.setSelectionRange) {
        try { el.setSelectionRange(focusInfo.start, focusInfo.end); } catch {}
      }
    }
  }
}

function renderApp() {
  showView('app');
  updateShellState();
  setContent(renderPage());
}

function renderPage() {
  if (state.role === 'desa') {
    return ({ dashboard:renderVillageDashboard, inventory:renderInventory, residents:renderResidents, status:renderStatus, templates:renderTemplates, history:renderHistory })[state.page]();
  }
  return ({ dashboard:renderCamatDashboard, incoming:renderIncoming, villages:renderVillages, accounts:renderAccounts, history:renderHistory })[state.page]();
}

function pageHeader(title, subtitle, actions='') {
  return `<div class="page-header"><div><h1>${title}</h1><p>${subtitle}</p></div>${actions?`<div class="header-actions">${actions}</div>`:''}</div>`;
}

function statCard(iconName, label, value, trend, color='') {
  return `<div class="stat-card"><div class="stat-top"><span class="stat-icon ${color}">${icon(iconName)}</span><span class="trend ${trend.startsWith('-')?'down':''}">${trend}</span></div><div class="value">${value}</div><div class="label">${label}</div></div>`;
}

function recentTable(items, camat=false) {
  return `<div class="table-card"><table class="data-table"><thead><tr><th>Nomor / Jenis</th>${camat?'<th>Asal desa</th>':'<th>Warga</th>'}<th>Tanggal</th><th>Status</th><th></th></tr></thead><tbody>${items.map(l=>`<tr><td><span class="primary">${esc(l.number)}</span><span class="secondary">${esc(l.type)}</span></td><td>${camat?`<span class="primary">${esc(l.village)}</span><span class="secondary">${esc(l.citizen)}</span>`:`<span class="primary">${esc(l.citizen)}</span><span class="secondary">${esc(l.nik)}</span>`}</td><td>${esc(l.date)}</td><td>${statusBadge(l.status)}</td><td><div class="table-actions"><button class="icon-btn" data-action="${camat?'review-letter':'view-letter'}" data-id="${l.id}" title="Lihat detail">${icon('eye','sm')}</button></div></td></tr>`).join('')}</tbody></table></div>`;
}

function renderVillageDashboard() {
  const counts = countStatuses(state.letters);
  return `${pageHeader('Selamat datang, Rahmat','Berikut ringkasan layanan administrasi Desa Barugaya hari ini.',`<button class="btn btn-primary" data-action="new-letter">${icon('plus','sm')} Buat surat baru</button>`)}
    <section class="welcome-banner"><div class="welcome-copy"><span class="mini">Pelayanan desa digital</span><h2>Layani warga lebih cepat hari ini.</h2><p>Buat usulan surat, kirim ke kecamatan, lalu pantau prosesnya secara transparan tanpa berkas berulang.</p><button class="btn" data-page="inventory">Mulai buat surat ${icon('chevron-right','sm')}</button></div><div class="banner-art"><img src="assets/images/banner-desa.svg" alt="Ilustrasi kantor desa"></div></section>
    <div class="stats-grid">${statCard('users','Total warga terdata',state.residents.length.toLocaleString('id-ID'),'+4.2%')}${statCard('file','Surat bulan ini',state.letters.length,'+12%', 'blue')}${statCard('clock','Menunggu proses',counts['Terkirim']+counts['Diterima'],'-2.1%', 'orange')}${statCard('check','Surat disetujui',counts['Disetujui'],'+8.4%', 'purple')}</div>
    <div class="dashboard-grid"><div>
      <section class="panel mb-14"><div class="panel-head"><div><h3>Aksi cepat</h3><p>Akses layanan yang sering digunakan</p></div></div><div class="panel-body"><div class="quick-actions">
        <button class="quick-action" data-action="new-letter"><span class="stat-icon">${icon('plus','sm')}</span><span><strong>Buat surat</strong><span>Ajukan surat warga</span></span></button>
        <button class="quick-action" data-action="add-resident"><span class="stat-icon blue">${icon('user-plus','sm')}</span><span><strong>Tambah warga</strong><span>Input data penduduk</span></span></button>
        <button class="quick-action" data-page="status"><span class="stat-icon orange">${icon('history','sm')}</span><span><strong>Lacak surat</strong><span>Pantau status usulan</span></span></button>
      </div></div></section>
      <section class="panel"><div class="panel-head"><div><h3>Surat terbaru</h3><p>Usulan surat yang terakhir diperbarui</p></div><button class="see-all" data-page="status">Lihat semua ${icon('chevron-right','sm')}</button></div>${recentTable(state.letters.slice(0,5))}</section>
    </div><div>
      <section class="panel mb-14"><div class="panel-head"><div><h3>Ringkasan status</h3><p>Progres surat bulan Agustus</p></div><span class="badge approved">Aktif</span></div><div class="panel-body"><div class="status-list">
        ${statusProgress('Disetujui',counts['Disetujui'],pct(counts['Disetujui'],state.letters.length),'')}${statusProgress('Diterima',counts['Diterima'],pct(counts['Diterima'],state.letters.length),'blue')}${statusProgress('Terkirim',counts['Terkirim'],pct(counts['Terkirim'],state.letters.length),'orange')}${statusProgress('Ditolak',counts['Ditolak'],pct(counts['Ditolak'],state.letters.length),'red')}
      </div></div></section>
      <section class="panel"><div class="panel-head"><div><h3>Aktivitas terbaru</h3><p>Pembaruan layanan hari ini</p></div></div><div class="panel-body activity-list">
        ${activity('check','Surat disetujui','Surat undangan H. Jamaluddin siap diambil.','15 menit lalu')}
        ${activity('send','Surat berhasil dikirim','Permohonan Muh. Akbar telah terkirim.','1 jam lalu')}
        ${activity('user-plus','Data warga ditambah','Data keluarga baru berhasil disimpan.','3 jam lalu')}
      </div></section>
    </div></div>`;
}

function statusProgress(label,count,width,color) {
  return `<div class="status-row"><i class="status-dot ${color}"></i><span>${label}</span><strong>${count}</strong><div class="progress"><i class="${color}" style="width:${Math.max(width,8)}%"></i></div></div>`;
}
function pct(count, total) { return total ? Math.round(count/total*100) : 0; }
function activity(ic,title,text,time) { return `<div class="activity-item"><span class="activity-icon">${icon(ic,'sm')}</span><div class="activity-copy"><strong>${title}</strong><p>${text}</p><time>${time}</time></div></div>`; }
function countStatuses(items) { return ['Terkirim','Diterima','Disetujui','Ditolak'].reduce((a,s)=>(a[s]=items.filter(x=>x.status===s).length,a),{}); }
function statusBadge(status) { const c={Terkirim:'sent',Diterima:'received',Disetujui:'approved',Ditolak:'rejected'}[status]||'sent'; return `<span class="badge ${c}">${status}</span>`; }

// ===== Paginasi generik: dipakai semua tabel/daftar =====
function paginate(items, scope, perPage=8) {
  state.pagination = state.pagination || {};
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  let page = state.pagination[scope] || 1;
  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;
  state.pagination[scope] = page;
  const start = (page - 1) * perPage;
  return { pageItems: items.slice(start, start + perPage), page, totalPages, total: items.length };
}
function paginationHtml(scope, page, totalPages, label) {
  if (totalPages <= 1) return `<div class="pagination"><span>${label}</span></div>`;
  const nums = [];
  for (let i=1;i<=totalPages;i++) nums.push(i);
  const btns = `<button class="page-btn" data-action="paginate" data-scope="${scope}" data-dir="prev" ${page===1?'disabled':''}>‹</button>`
    + nums.map(i=>`<button class="page-btn ${i===page?'active':''}" data-action="paginate" data-scope="${scope}" data-num="${i}">${i}</button>`).join('')
    + `<button class="page-btn" data-action="paginate" data-scope="${scope}" data-dir="next" ${page===totalPages?'disabled':''}>›</button>`;
  return `<div class="pagination"><span>${label}</span><div class="page-buttons">${btns}</div></div>`;
}

// ===== Ekspor CSV sederhana (tanpa backend) =====
function downloadCsv(filename, rows) {
  const csv = rows.map(row => row.map(cell => {
    const v = String(cell ?? '');
    return /[",\n;]/.test(v) ? `"${v.replace(/"/g,'""')}"` : v;
  }).join(';')).join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function exportData(kind) {
  if (kind === 'residents') {
    downloadCsv('data-warga-barugaya.csv', [['NIK','Nama','Jenis Kelamin','Tempat Tanggal Lahir','Alamat','Status Keluarga'], ...state.residents.map(r=>[r.nik,r.name,r.gender,r.birth,r.address,r.status])]);
  } else if (kind === 'status') {
    const filtered = state.statusFilter==='Semua' ? state.letters : state.letters.filter(l=>l.status===state.statusFilter);
    downloadCsv('laporan-status-surat.csv', [['Nomor','Jenis','Nama Warga','NIK','Tanggal','Status','Catatan'], ...filtered.map(l=>[l.number,l.type,l.citizen,l.nik,l.date,l.status,l.reason])]);
  } else if (kind === 'incoming') {
    const filtered = state.letterFilter==='Semua' ? state.incoming : state.incoming.filter(l=>l.status===state.letterFilter);
    downloadCsv('surat-masuk-kecamatan.csv', [['Nomor','Jenis','Asal Desa','Nama Warga','NIK','Dikirim','Status','Catatan'], ...filtered.map(l=>[l.number,l.type,l.village,l.citizen,l.nik,l.date,l.status,l.reason])]);
  } else if (kind === 'history') {
    const items = state.role==='desa' ? state.letters : state.incoming;
    const filtered = items.filter(l=>['Disetujui','Ditolak'].includes(l.status));
    downloadCsv('riwayat-surat.csv', [['Tanggal Keputusan','Nomor','Jenis','Warga/Desa','Status','Catatan'], ...filtered.map(l=>[l.updated,l.number,l.type,state.role==='camat'?l.village:l.citizen,l.status,l.reason])]);
  } else if (kind === 'accounts') {
    downloadCsv('akun-desa.csv', [['Desa','Admin','Username','Kontak','Dibuat','Status'], ...state.accounts.map(a=>[a.name,a.admin,a.user,a.phone,a.created,a.status])]);
  }
  toast('Berkas diunduh','File CSV berhasil dibuat dan diunduh ke perangkat Anda.');
}

// ===== Rendering template surat: konten yang diedit di halaman Template
// benar-benar dipakai saat surat dibuat/dicetak (bukan cuma dekorasi). =====
function fillTemplateVars(letter) {
  const resident = state.residents.find(r=>r.nik===letter.nik);
  const villageName = letter.village || 'Desa Barugaya';
  return {
    nomor_surat: letter.number || '', nama_warga: letter.citizen || '', nik: letter.nik || '',
    tempat_tanggal_lahir: resident?.birth || '-',
    alamat: resident?.address || `${villageName}, Kecamatan Polongbangkeng Timur`,
    keperluan: letter.purpose || '-', tanggal: letter.date || ''
  };
}
function renderTemplateBody(letter) {
  const tpl = state.templates[letter.type]?.content || defaultTemplate(letter.type);
  const vars = fillTemplateVars(letter);
  let text = esc(tpl).replace(/\{\{(\w+)\}\}/g, (m,key) => key in vars ? esc(vars[key]) : m);
  text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/__(.+?)__/g, '<u>$1</u>').replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<i>$1</i>');
  return text.split('\n').map(line => line.trim()==='' ? '<br>' : `<p>${line}</p>`).join('');
}

function renderInventory() {
  const counts = Object.fromEntries(LETTER_TYPES.map(t=>[t.name,state.letters.filter(l=>l.type===t.name).length]));
  return `${pageHeader('Inventaris Surat','Pilih jenis surat yang ingin dibuat dan diajukan ke kecamatan.',`<button class="btn btn-outline" data-page="templates">${icon('template','sm')} Kelola template</button><button class="btn btn-primary" data-action="new-letter">${icon('plus','sm')} Buat surat</button>`)}
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search','sm')}</span><input id="inventory-search" placeholder="Cari jenis surat..."></div><div class="toolbar-spacer"></div><span class="small-note">${icon('info','sm')} 7 template siap digunakan</span></div>
    <div class="inventory-grid" id="inventory-grid">${LETTER_TYPES.map(t=>`<article class="letter-card color-${t.color}" data-letter-name="${t.name.toLowerCase()}"><div class="letter-card-top"><span class="letter-icon">${icon(t.icon,'lg')}</span><span class="template-ready">${icon('check','sm')} Template aktif</span></div><h3>${t.name}</h3><p>${t.desc}</p><div class="letter-meta"><span>${counts[t.name]||0} surat dibuat</span><button class="btn btn-sm btn-secondary" data-action="new-letter" data-type="${t.name}">Buat surat ${icon('chevron-right','sm')}</button></div></article>`).join('')}</div>`;
}

function renderResidents() {
  const q = state.residentSearch.toLowerCase();
  const filtered = state.residents.filter(r =>
    (!q || `${r.name} ${r.nik} ${r.address}`.toLowerCase().includes(q)) &&
    (!state.residentDusun || r.address.includes(state.residentDusun)) &&
    (!state.residentGender || r.gender===state.residentGender)
  );
  const male = state.residents.filter(r=>r.gender==='Laki-laki').length;
  const female = state.residents.filter(r=>r.gender==='Perempuan').length;
  const heads = state.residents.filter(r=>r.status==='Kepala Keluarga').length;
  const { pageItems, page, totalPages } = paginate(filtered, 'residents', 8);
  const hasFilter = state.residentSearch || state.residentDusun || state.residentGender;
  return `${pageHeader('Data Warga','Kelola data penduduk Desa Barugaya sebagai sumber pengisian surat.',`<button class="btn btn-outline" data-action="export" data-export="residents">${icon('download','sm')} Ekspor data</button><button class="btn btn-primary" data-action="add-resident">${icon('user-plus','sm')} Tambah warga</button>`)}
    <div class="stats-grid">${statCard('users','Total warga terdata',state.residents.length.toLocaleString('id-ID'),`${heads} KK`)}${statCard('user','Laki-laki',male,`${state.residents.length?Math.round(male/state.residents.length*100):0}%`,'blue')}${statCard('user','Perempuan',female,`${state.residents.length?Math.round(female/state.residents.length*100):0}%`,'purple')}${statCard('home','Kepala keluarga',heads,'terdata','orange')}</div>
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search','sm')}</span><input id="resident-search" value="${esc(state.residentSearch)}" placeholder="Cari nama atau NIK..."></div><div style="width:170px">${comboboxHtml({ name:'dusun-filter', id:'dusun-filter', readOnly:true, size:'combobox-sm', selectedValue:state.residentDusun, options:[{value:'',label:'Semua dusun'},{value:'Dusun Barugaya',label:'Dusun Barugaya'},{value:'Dusun Panaikang',label:'Dusun Panaikang'},{value:'Dusun Bontomanai',label:'Dusun Bontomanai'}] })}</div><div style="width:170px">${comboboxHtml({ name:'gender-filter', id:'gender-filter', readOnly:true, size:'combobox-sm', selectedValue:state.residentGender, options:[{value:'',label:'Semua jenis kelamin'},{value:'Laki-laki',label:'Laki-laki'},{value:'Perempuan',label:'Perempuan'}] })}</div><div class="toolbar-spacer"></div><button class="btn btn-sm btn-outline" data-action="reset-filter" data-scope="residents" ${hasFilter?'':'disabled'}>${icon('x','sm')} Reset filter</button></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>NIK</th><th>Nama warga</th><th>Jenis kelamin</th><th>Tempat, tanggal lahir</th><th>Alamat</th><th>Status keluarga</th><th></th></tr></thead><tbody>${pageItems.length?pageItems.map((r,i)=>`<tr><td class="primary">${esc(r.nik)}</td><td><div class="table-user"><span class="avatar ${i%2?'green':''}">${initials(r.name)}</span><span class="primary">${esc(r.name)}</span></div></td><td>${esc(r.gender)}</td><td>${esc(r.birth)}</td><td>${esc(r.address)}</td><td>${esc(r.status)}</td><td><div class="table-actions"><button class="icon-btn" data-action="view-resident" data-nik="${r.nik}">${icon('eye','sm')}</button><button class="icon-btn" data-action="edit-resident" data-nik="${r.nik}">${icon('edit','sm')}</button></div></td></tr>`).join(''):`<tr><td colspan="7" class="empty-row">Tidak ada warga yang cocok dengan filter ini.</td></tr>`}</tbody></table>${paginationHtml('residents',page,totalPages,`Menampilkan ${pageItems.length} dari ${filtered.length} warga`)}</div>`;
}
function initials(name) { return name.replace(/[^A-Za-zÀ-ÿ ]/g,'').split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase() || 'WG'; }

function monthAbbr(name) { return { 'Agustus':'Agu', 'Juli':'Jul' }[name] || name.slice(0,3); }
function matchesMonth(dateStr, monthLabel) {
  if (!monthLabel) return true;
  const [name, year] = monthLabel.split(' ');
  return dateStr.endsWith(`${monthAbbr(name)} ${year}`);
}

function renderStatus() {
  const counts=countStatuses(state.letters);
  const q=(state.statusSearch||'').toLowerCase();
  const filtered=state.letters.filter(l =>
    (state.statusFilter==='Semua'||l.status===state.statusFilter) &&
    matchesMonth(l.date, state.statusMonth) &&
    (!q || `${l.number} ${l.type} ${l.citizen}`.toLowerCase().includes(q))
  );
  const { pageItems, page, totalPages } = paginate(filtered, 'status', 8);
  return `${pageHeader('Status Surat','Pantau progres setiap usulan beserta catatan atau alasan dari kecamatan.',`<button class="btn btn-primary" data-action="new-letter">${icon('plus','sm')} Buat surat baru</button>`)}
    <div class="status-summary">${statusMini('Terkirim',counts.Terkirim,'blue')}${statusMini('Diterima',counts.Diterima,'orange')}${statusMini('Disetujui',counts.Disetujui,'')}${statusMini('Ditolak',counts.Ditolak,'red')}</div>
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search','sm')}</span><input id="status-search" value="${esc(state.statusSearch||'')}" placeholder="Cari nomor, jenis, atau warga..."></div><div style="width:150px">${comboboxHtml({ name:'status-filter', id:'status-filter', readOnly:true, size:'combobox-sm', selectedValue:state.statusFilter, options:['Semua','Terkirim','Diterima','Disetujui','Ditolak'].map(s=>({value:s,label:s})) })}</div><div style="width:150px">${comboboxHtml({ name:'status-month', id:'status-month', readOnly:true, size:'combobox-sm', selectedValue:state.statusMonth, options:[{value:'',label:'Semua bulan'},{value:'Agustus 2026',label:'Agustus 2026'},{value:'Juli 2026',label:'Juli 2026'}] })}</div><div class="toolbar-spacer"></div><button class="btn btn-sm btn-outline" data-action="export" data-export="status">${icon('download','sm')} Unduh laporan</button></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>Nomor / Jenis</th><th>Nama warga</th><th>Tanggal</th><th>Status</th><th>Catatan / alasan</th><th></th></tr></thead><tbody>${pageItems.length?pageItems.map(l=>`<tr><td><span class="primary">${esc(l.number)}</span><span class="secondary">${esc(l.type)}</span></td><td><span class="primary">${esc(l.citizen)}</span><span class="secondary">${esc(l.nik)}</span></td><td>${esc(l.date)}<span class="secondary">Diperbarui ${esc(l.updated)}</span></td><td>${statusBadge(l.status)}</td><td><div class="reason">${icon('info','sm')}<span>${esc(l.reason)}</span></div></td><td><div class="table-actions"><button class="icon-btn" data-action="view-letter" data-id="${l.id}">${icon('eye','sm')}</button>${l.status==='Disetujui'?`<button class="icon-btn" data-action="print-letter" data-id="${l.id}">${icon('printer','sm')}</button>`:''}</div></td></tr>`).join(''):`<tr><td colspan="6" class="empty-row">Tidak ada surat yang cocok dengan filter ini.</td></tr>`}</tbody></table>${paginationHtml('status',page,totalPages,`Menampilkan ${pageItems.length} dari ${filtered.length} surat`)}</div>`;
}
function statusMini(label,count,color){ return `<div class="status-mini"><i class="status-dot ${color}"></i><div><strong>${count}</strong><span>${label}</span></div></div>`; }

function renderTemplates() {
  return `${pageHeader('Template Surat','Edit format sekali, simpan, lalu gunakan kembali untuk setiap pengajuan.',`<button class="btn btn-outline" data-action="template-guide">${icon('info','sm')} Panduan variabel</button>`)}
    <div class="small-note mb-14">${icon('info','sm')} Gunakan variabel seperti <b>{{nama_warga}}</b>, <b>{{nik}}</b>, dan <b>{{keperluan}}</b>. Data akan terisi otomatis saat surat dibuat.</div>
    <div class="template-grid">${LETTER_TYPES.map(t=>`<article class="template-card color-${t.color}"><div class="template-preview"><div class="paper-mini"><i class="paper-logo"></i><i class="paper-line dark"></i><i class="paper-line short"></i><br><i class="paper-line"></i><i class="paper-line"></i><i class="paper-line"></i><i class="paper-line short"></i></div></div><div class="template-info"><span class="badge approved">Aktif</span><h3>${t.name}</h3><p>Format baku ${t.name.toLowerCase()} Desa Barugaya untuk pengajuan ke kecamatan.</p><div class="template-footer"><span class="edited">Diedit ${esc(state.templates[t.name]?.edited||'-')}</span><button class="btn btn-sm btn-outline" data-action="edit-template" data-type="${t.name}">${icon('edit','sm')} Edit template</button></div></div></article>`).join('')}</div>`;
}

function renderHistory() {
  const items = state.role==='desa'?state.letters:state.incoming;
  const q=(state.historySearch||'').toLowerCase();
  const filtered=items.filter(l=>['Disetujui','Ditolak'].includes(l.status))
    .filter(l => !state.historyStatusFilter || l.status===state.historyStatusFilter)
    .filter(l => !state.historyVillageFilter || l.village===state.historyVillageFilter)
    .filter(l => matchesMonth(l.updated, state.historyMonth))
    .filter(l => !q || `${l.number} ${l.type} ${l.citizen||''} ${l.village||''}`.toLowerCase().includes(q));
  const { pageItems, page, totalPages } = paginate(filtered, 'history', 8);
  return `${pageHeader('Riwayat Persuratan',`Arsip keputusan surat yang telah selesai diproses ${state.role==='desa'?'untuk Desa Barugaya':'oleh Kecamatan Polongbangkeng Timur'}.`,`<button class="btn btn-outline" data-action="export" data-export="history">${icon('download','sm')} Ekspor riwayat</button>`)}
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search','sm')}</span><input id="history-search" value="${esc(state.historySearch||'')}" placeholder="Cari riwayat surat..."></div><div style="width:150px">${comboboxHtml({ name:'history-status-filter', id:'history-status-filter', readOnly:true, size:'combobox-sm', selectedValue:state.historyStatusFilter, options:[{value:'',label:'Semua status'},{value:'Disetujui',label:'Disetujui'},{value:'Ditolak',label:'Ditolak'}] })}</div>${state.role==='camat'?`<div style="width:190px">${comboboxHtml({ name:'history-village-filter', id:'history-village-filter', selectedValue:state.historyVillageFilter, options: state.villages.map(v=>({ value:v.name, label:v.name })), placeholder:'Semua desa', size:'combobox-sm' })}</div>`:''}<div style="width:150px">${comboboxHtml({ name:'history-month', id:'history-month', readOnly:true, size:'combobox-sm', selectedValue:state.historyMonth, options:[{value:'',label:'Semua bulan'},{value:'Agustus 2026',label:'Agustus 2026'},{value:'Juli 2026',label:'Juli 2026'}] })}</div><div class="toolbar-spacer"></div></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>Tanggal keputusan</th><th>Nomor / jenis</th>${state.role==='camat'?'<th>Asal desa</th>':'<th>Nama warga</th>'}<th>Status akhir</th><th>Alasan / catatan keputusan</th><th></th></tr></thead><tbody>${pageItems.length?pageItems.map(l=>`<tr><td>${esc(l.updated)}</td><td><span class="primary">${esc(l.number)}</span><span class="secondary">${esc(l.type)}</span></td><td><span class="primary">${esc(state.role==='camat'?l.village:l.citizen)}</span><span class="secondary">${esc(l.nik)}</span></td><td>${statusBadge(l.status)}</td><td><div class="reason">${icon('info','sm')}<span>${esc(l.reason)}</span></div></td><td><div class="table-actions"><button class="icon-btn" data-action="${state.role==='camat'?'review-letter':'view-letter'}" data-id="${l.id}">${icon('eye','sm')}</button><button class="icon-btn" data-action="print-letter" data-id="${l.id}">${icon('download','sm')}</button></div></td></tr>`).join(''):`<tr><td colspan="6" class="empty-row">Belum ada riwayat yang cocok dengan filter ini.</td></tr>`}</tbody></table>${paginationHtml('history',page,totalPages,`${filtered.length} riwayat keputusan`)}</div>`;
}

function renderCamatDashboard() {
  const counts=countStatuses(state.incoming); const totalResidents=state.villages.reduce((a,v)=>a+v.residents,0);
  return `${pageHeader('Selamat datang di Portal Kecamatan','Pantau layanan desa dan selesaikan peninjauan surat hari ini.',`<button class="btn btn-primary" data-page="incoming">${icon('mail','sm')} Tinjau surat masuk</button>`)}
    <section class="welcome-banner"><div class="welcome-copy"><span class="mini">Pusat kendali kecamatan</span><h2>Ada ${counts.Terkirim} surat baru menunggu tinjauan.</h2><p>Periksa kelengkapan berkas dari desa dan berikan keputusan beserta alasan agar layanan warga tetap transparan.</p><button class="btn" data-page="incoming">Buka antrean surat ${icon('chevron-right','sm')}</button></div><div class="banner-art"><img src="assets/images/banner-camat.svg" alt="Ilustrasi kantor kecamatan"></div></section>
    <div class="stats-grid">${statCard('village','Desa terpantau',state.villages.length,`${state.villages.filter(v=>v.status==='Aktif').length} aktif`)}${statCard('users','Warga terdata',totalResidents.toLocaleString('id-ID'),'+3.8%','blue')}${statCard('mail','Surat masuk bulan ini',state.incoming.length,'+14%','orange')}${statCard('check','Tingkat persetujuan',`${state.incoming.length?Math.round(counts['Disetujui']/state.incoming.length*100):0}%`,'+2.4%','purple')}</div>
    <div class="dashboard-grid"><div>
      <section class="panel mb-14"><div class="panel-head"><div><h3>Surat perlu ditinjau</h3><p>Urut berdasarkan waktu pengiriman terbaru</p></div><button class="see-all" data-page="incoming">Lihat semua ${icon('chevron-right','sm')}</button></div>${recentTable(state.incoming.filter(x=>['Terkirim','Diterima'].includes(x.status)).slice(0,5),true)}</section>
      <section class="panel"><div class="panel-head"><div><h3>Pantauan desa</h3><p>Ringkasan penduduk dan surat masuk</p></div><button class="see-all" data-page="villages">Semua desa ${icon('chevron-right','sm')}</button></div><div class="panel-body"><div class="quick-actions">${state.villages.slice(0,3).map(v=>`<button class="quick-action" data-action="view-village" data-village="${v.name}"><span class="village-avatar">${icon('village','sm')}${v.incoming?`<i class="incoming-count">${v.incoming}</i>`:''}</span><span><strong>${v.name.replace('Desa ','')}</strong><span>${v.residents.toLocaleString('id-ID')} warga · ${v.incoming} masuk</span></span></button>`).join('')}</div></div></section>
    </div><div>
      <section class="panel mb-14"><div class="panel-head"><div><h3>Status surat</h3><p>Distribusi bulan ini</p></div><span class="badge approved">Real-time</span></div><div class="panel-body"><div class="status-list">${statusProgress('Disetujui',counts.Disetujui,pct(counts.Disetujui,state.incoming.length),'')}${statusProgress('Diterima',counts.Diterima,pct(counts.Diterima,state.incoming.length),'blue')}${statusProgress('Terkirim',counts.Terkirim,pct(counts.Terkirim,state.incoming.length),'orange')}${statusProgress('Ditolak',counts.Ditolak,pct(counts.Ditolak,state.incoming.length),'red')}</div></div></section>
      <section class="panel"><div class="panel-head"><div><h3>Aktivitas petugas</h3><p>Pembaruan keputusan hari ini</p></div></div><div class="panel-body activity-list">${activity('check','Surat disetujui','Penetapan kader dari Desa Timbuseng.','28 menit lalu')}${activity('mail','Berkas diterima','Undangan dari Desa Massamaturu.','1 jam lalu')}${activity('x','Surat dikembalikan','Edaran Desa Kale Ko’mara perlu diperbaiki.','2 jam lalu')}</div></section>
    </div></div>`;
}

function renderIncoming() {
  const counts=countStatuses(state.incoming);
  const q=(state.incomingSearch||'').toLowerCase();
  const filtered=state.incoming.filter(l =>
    (state.letterFilter==='Semua'||l.status===state.letterFilter) &&
    (!state.villageFilter || l.village===state.villageFilter) &&
    (!q || `${l.number} ${l.citizen} ${l.village}`.toLowerCase().includes(q))
  );
  const { pageItems, page, totalPages } = paginate(filtered, 'incoming', 8);
  const hasFilter = state.incomingSearch || (state.letterFilter && state.letterFilter!=='Semua') || state.villageFilter;
  return `${pageHeader('Surat Masuk','Tinjau usulan desa, putuskan status, dan berikan alasan yang jelas.',`<button class="btn btn-outline" data-action="refresh">${icon('refresh','sm')} Sinkronkan</button>`)}
    <div class="status-summary">${statusMini('Baru terkirim',counts.Terkirim,'blue')}${statusMini('Sedang ditinjau',counts.Diterima,'orange')}${statusMini('Disetujui',counts.Disetujui,'')}${statusMini('Ditolak',counts.Ditolak,'red')}</div>
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search','sm')}</span><input id="incoming-search" value="${esc(state.incomingSearch||'')}" placeholder="Cari nomor, warga, atau desa..."></div><div style="width:150px">${comboboxHtml({ name:'incoming-filter', id:'incoming-filter', readOnly:true, size:'combobox-sm', selectedValue:state.letterFilter, options:['Semua','Terkirim','Diterima','Disetujui','Ditolak'].map(s=>({value:s,label:s})) })}</div><div style="width:190px">${comboboxHtml({ name:'village-filter', id:'village-filter', selectedValue:state.villageFilter, options: state.villages.map(v=>({ value:v.name, label:v.name })), placeholder:'Semua desa', size:'combobox-sm' })}</div><div class="toolbar-spacer"></div><button class="btn btn-sm btn-outline" data-action="reset-filter" data-scope="incoming" ${hasFilter?'':'disabled'}>${icon('x','sm')} Reset filter</button></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>Nomor / jenis</th><th>Asal desa</th><th>Nama warga</th><th>Dikirim</th><th>Status</th><th>Catatan terakhir</th><th></th></tr></thead><tbody>${pageItems.length?pageItems.map(l=>`<tr><td><span class="primary">${esc(l.number)}</span><span class="secondary">${esc(l.type)}</span></td><td><span class="primary">${esc(l.village)}</span></td><td><span class="primary">${esc(l.citizen)}</span><span class="secondary">${esc(l.nik)}</span></td><td>${esc(l.date)}</td><td>${statusBadge(l.status)}</td><td><div class="reason"><span>${esc(l.reason)}</span></div></td><td><button class="btn btn-sm ${['Terkirim','Diterima'].includes(l.status)?'btn-secondary':'btn-outline'}" data-action="review-letter" data-id="${l.id}">${icon('eye','sm')} Tinjau</button></td></tr>`).join(''):`<tr><td colspan="7" class="empty-row">Tidak ada surat yang cocok dengan filter ini.</td></tr>`}</tbody></table>${paginationHtml('incoming',page,totalPages,`Menampilkan ${pageItems.length} dari ${state.incoming.length} surat`)}</div>`;
}

function renderVillages() {
  const q=(state.villageSearch||'').toLowerCase();
  const filtered = state.villages.filter(v =>
    (!q || v.name.toLowerCase().includes(q)) &&
    (!state.villageStatusFilter || v.status===state.villageStatusFilter)
  );
  const { pageItems, page, totalPages } = paginate(filtered, 'villages', 8);
  return `${pageHeader('Daftar Desa','Pantau aktivitas, jumlah penduduk, dan surat masuk dari setiap desa.',`<button class="btn btn-primary" data-action="add-account">${icon('user-plus','sm')} Tambah akun desa</button>`)}
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search','sm')}</span><input id="village-search" value="${esc(state.villageSearch||'')}" placeholder="Cari nama desa..."></div><div style="width:150px">${comboboxHtml({ name:'village-status-filter', id:'village-status-filter', readOnly:true, size:'combobox-sm', selectedValue:state.villageStatusFilter, options:[{value:'',label:'Semua status'},{value:'Aktif',label:'Aktif'},{value:'Nonaktif',label:'Nonaktif'}] })}</div><div class="toolbar-spacer"></div><span class="small-note">${icon('users','sm')} ${state.villages.reduce((a,v)=>a+v.residents,0).toLocaleString('id-ID')} warga terpantau · Kec. Polongbangkeng Timur</span></div>
    <div class="village-grid" id="village-grid">${pageItems.length?pageItems.map((v,i)=>`<article class="village-card" style="animation-delay:${Math.min(i*45,360)}ms"><div class="village-head"><span class="village-avatar color-${LETTER_TYPES[i%7].color}">${icon('village','lg')}${v.incoming?`<i class="incoming-count">${v.incoming}</i>`:''}</span><div><h3>${esc(v.name)}</h3><p>${esc(v.district)}</p></div><div class="village-head-actions"><button class="icon-btn" title="Edit desa" data-action="edit-village" data-village="${v.name}">${icon('edit','sm')}</button><button class="icon-btn" data-action="view-village" data-village="${v.name}">${icon('more','sm')}</button></div></div><div class="village-stats"><div class="village-stat"><strong>${v.residents.toLocaleString('id-ID')}</strong><span>Warga terdata</span></div><div class="village-stat"><strong>${v.incoming}</strong><span>Surat masuk</span></div></div><div class="village-foot"><span class="${v.status==='Aktif'?'online':'offline'}">${v.status}</span><span>${esc(v.active)}</span><button class="see-all" data-action="view-village" data-village="${v.name}">Pantau ${icon('chevron-right','sm')}</button></div></article>`).join(''):`<div class="empty-row">Tidak ada desa yang cocok dengan filter ini.</div>`}</div>
    ${paginationHtml('villages',page,totalPages,`Menampilkan ${pageItems.length} dari ${filtered.length} desa`)}`;
}

function renderAccounts() {
  const q=(state.accountSearch||'').toLowerCase();
  const filtered = state.accounts.filter(a =>
    (!q || `${a.name} ${a.admin} ${a.user}`.toLowerCase().includes(q)) &&
    (!state.accountStatusFilter || a.status===state.accountStatusFilter)
  );
  return `${pageHeader('Akun Desa','Buat dan kelola akses desa ke sistem persuratan kecamatan.',`<button class="btn btn-primary" data-action="add-account">${icon('user-plus','sm')} Tambah akun desa</button>`)}
    <div class="small-note mb-14">${icon('shield','sm')} Hanya akun kecamatan yang dapat membuat akun desa. Setiap desa memiliki username unik dan dapat mengganti sandi setelah login pertama.</div>
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search','sm')}</span><input id="account-search" value="${esc(state.accountSearch||'')}" placeholder="Cari akun atau desa..."></div><div style="width:150px">${comboboxHtml({ name:'account-status-filter', id:'account-status-filter', readOnly:true, size:'combobox-sm', selectedValue:state.accountStatusFilter, options:[{value:'',label:'Semua status'},{value:'Aktif',label:'Aktif'},{value:'Nonaktif',label:'Nonaktif'}] })}</div><div class="toolbar-spacer"></div><button class="btn btn-sm btn-outline" data-action="export" data-export="accounts">${icon('download','sm')} Ekspor akun</button></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>Desa</th><th>Admin desa</th><th>Username</th><th>Kontak</th><th>Dibuat</th><th>Status</th><th></th></tr></thead><tbody>${filtered.length?filtered.map((a)=>{const i=state.accounts.indexOf(a);return `<tr><td><div class="table-user"><span class="village-avatar" style="width:32px;height:32px;border-radius:9px">${icon('village','sm')}</span><span><span class="primary">${esc(a.name)}</span><span class="secondary">${esc(a.district)}</span></span></div></td><td>${esc(a.admin)}</td><td><span class="primary">${esc(a.user)}</span><span class="secondary">Sandi terenkripsi</span></td><td>${esc(a.phone)}</td><td>${esc(a.created)}</td><td><span class="badge ${a.status==='Aktif'?'approved':'rejected'}">${esc(a.status)}</span></td><td><div class="table-actions"><button class="icon-btn" data-action="copy-account" data-index="${i}" title="Salin kredensial">${icon('copy','sm')}</button><button class="icon-btn" data-action="edit-account" data-index="${i}">${icon('edit','sm')}</button><button class="icon-btn" data-action="account-menu" data-index="${i}" title="Kelola akun">${icon('more','sm')}</button></div></td></tr>`;}).join(''):`<tr><td colspan="7" class="empty-row">Tidak ada akun yang cocok dengan filter ini.</td></tr>`}</tbody></table><div class="pagination"><span>${filtered.length} dari ${state.accounts.length} akun desa</span></div></div>`;
}

function openModal(inner, size='') { $('#modal-root').innerHTML=`<div class="modal-backdrop" data-action="backdrop"><section class="modal ${size}">${inner}</section></div>`; }
function closeModal(){ $('#modal-root').innerHTML=''; }
function modalHead(title, subtitle, ic='file'){ return `<div class="modal-head"><span class="modal-title-icon">${icon(ic)}</span><div><h2>${title}</h2><p>${subtitle}</p></div><button class="icon-btn" data-action="close-modal">${icon('x','sm')}</button></div>`; }

// ===== Searchable combobox: pengganti <select> untuk daftar yang bisa panjang =====
// (mis. daftar warga, daftar desa) supaya pengguna tinggal ketik untuk menyaring
// daripada scroll opsi satu-satu.
let comboboxSeq = 0;
let comboboxRegistry = {};

function comboboxHtml({ name, options, selectedValue = '', placeholder = 'Ketik untuk mencari...', required = false, size = '', id: hiddenId = '', readOnly = false }) {
  const id = `cb-${name}-${++comboboxSeq}`;
  comboboxRegistry[id] = options; // [{ value, label, sub }]
  const initialValue = selectedValue || (readOnly && options[0] ? options[0].value : '');
  const selected = options.find(o => o.value === initialValue);
  return `<div class="combobox" data-combobox="${id}">
    <input type="text" class="combobox-input ${size}" autocomplete="off" placeholder="${esc(placeholder)}" value="${esc(selected ? selected.label : '')}" ${readOnly ? 'readonly' : ''}>
    <input type="hidden" name="${name}" ${hiddenId ? `id="${hiddenId}"` : ''} value="${esc(initialValue)}" ${required ? 'required' : ''}>
    <span class="combobox-caret">▾</span>
    <div class="combobox-list" hidden></div>
  </div>`;
}

function comboboxOptionsList(wrap, query = '') {
  const options = comboboxRegistry[wrap.dataset.combobox] || [];
  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter(o => `${o.label} ${o.sub || ''}`.toLowerCase().includes(q)) : options;
  return { filtered: filtered.slice(0, 50), total: filtered.length };
}

function openComboboxList(wrap, query = '') {
  const list = wrap.querySelector('.combobox-list');
  const { filtered, total } = comboboxOptionsList(wrap, query);
  list.innerHTML = filtered.length
    ? filtered.map((o, i) => `<div class="combobox-option${i === 0 ? ' active' : ''}" data-value="${esc(o.value)}" data-label="${esc(o.label)}">${esc(o.label)}${o.sub ? `<span class="opt-sub">${esc(o.sub)}</span>` : ''}</div>`).join('') + (total > filtered.length ? `<div class="combobox-more">+${total - filtered.length} hasil lain, persempit pencarian...</div>` : '')
    : `<div class="combobox-empty">Tidak ada hasil ditemukan</div>`;
  list.hidden = false;
}

function closeAllComboboxLists() {
  $$('.combobox-list').forEach(l => l.hidden = true);
}

document.addEventListener('focusin', e => {
  const input = e.target.closest('.combobox-input');
  if (input) openComboboxList(input.closest('.combobox'));
});

document.addEventListener('input', e => {
  const input = e.target.closest('.combobox-input');
  if (input) {
    const wrap = input.closest('.combobox');
    wrap.querySelector('input[type="hidden"]').value = ''; // ketikan baru = belum pilih opsi valid
    openComboboxList(wrap, input.value);
  }
});

document.addEventListener('keydown', e => {
  const input = e.target.closest('.combobox-input');
  if (!input) return;
  const wrap = input.closest('.combobox');
  const list = wrap.querySelector('.combobox-list');
  if (e.key === 'Escape') { list.hidden = true; return; }
  if (list.hidden) return;
  const opts = [...list.querySelectorAll('.combobox-option')];
  if (!opts.length) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const cur = opts.findIndex(o => o.classList.contains('active'));
    const next = e.key === 'ArrowDown' ? Math.min(cur + 1, opts.length - 1) : Math.max(cur - 1, 0);
    opts.forEach(o => o.classList.remove('active'));
    opts[next].classList.add('active');
    opts[next].scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter') {
    e.preventDefault();
    (opts.find(o => o.classList.contains('active')) || opts[0]).click();
  }
});

document.addEventListener('click', e => {
  const opt = e.target.closest('.combobox-option');
  if (opt) {
    const wrap = opt.closest('.combobox');
    const hiddenInput = wrap.querySelector('input[type="hidden"]');
    wrap.querySelector('.combobox-input').value = opt.dataset.label;
    hiddenInput.value = opt.dataset.value;
    wrap.querySelector('.combobox-list').hidden = true;
    hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  if (!e.target.closest('.combobox')) closeAllComboboxLists();
});

function openNewLetter(type='') {
  const selected=type || LETTER_TYPES[0].name;
  openModal(`<form id="new-letter-form">${modalHead('Buat usulan surat','Isi data, pratinjau, lalu kirim ke kecamatan.','mail')}<div class="modal-body"><div class="form-grid">
    <div class="field span-2"><label class="form-label">Jenis surat</label>${comboboxHtml({ name:'type', required:true, readOnly:true, selectedValue:selected, options: LETTER_TYPES.map(t=>({value:t.name,label:t.name})) })}</div>
    <div class="field span-2"><label class="form-label">Warga pemohon</label>${comboboxHtml({ name:'resident', options: state.residents.map(r=>({ value:r.nik, label:r.name, sub:r.nik })), placeholder:'Cari nama atau NIK warga...', required:true })}<span class="helper">Data identitas akan terisi otomatis dari data warga.</span></div>
    <div class="field"><label class="form-label">Nomor surat</label><input name="number" value="140/${String(state.letters.length+32).padStart(3,'0')}/DB/VIII/2026" required></div>
    <div class="field"><label class="form-label">Tanggal surat</label><input name="date" type="date" value="2026-08-13" required></div>
    <div class="field span-2"><label class="form-label">Ditujukan kepada</label><input name="destination" value="Camat Polongbangkeng Timur, Kabupaten Takalar" required></div>
    <div class="field span-2"><label class="form-label">Keperluan / perihal</label><textarea name="purpose" placeholder="Jelaskan keperluan pengajuan surat..." required></textarea></div>
    <div class="field span-2"><label class="form-label">Catatan tambahan <span class="muted">(opsional)</span></label><textarea name="note" placeholder="Catatan untuk petugas kecamatan" style="min-height:65px"></textarea></div>
    <div class="small-note span-2">${icon('info','sm')} Surat akan dibuat menggunakan template aktif dan langsung dikirim ke antrean Kecamatan Polongbangkeng Timur.</div>
  </div></div><div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Batal</button><button type="button" class="btn btn-secondary" data-action="preview-new-letter">${icon('eye','sm')} Pratinjau</button><button type="submit" class="btn btn-primary">${icon('send','sm')} Simpan & kirim</button></div></form>`,'modal-lg');
}

function openAddResident(existing=null) {
  openModal(`<form id="resident-form">${modalHead(existing?'Edit data warga':'Tambah data warga',existing?'Perbarui informasi penduduk.':'Input data penduduk Desa Barugaya.','user-plus')}<div class="modal-body"><div class="form-grid">
    <div class="field"><label class="form-label">NIK</label><input name="nik" maxlength="16" value="${esc(existing?.nik||'')}" placeholder="16 digit NIK" ${existing?'readonly':''} required></div>
    <div class="field"><label class="form-label">Nama lengkap</label><input name="name" value="${esc(existing?.name||'')}" placeholder="Sesuai KTP" required></div>
    <div class="field"><label class="form-label">Jenis kelamin</label>${comboboxHtml({ name:'gender', readOnly:true, selectedValue: existing?.gender||'Laki-laki', options:[{value:'Laki-laki',label:'Laki-laki'},{value:'Perempuan',label:'Perempuan'}] })}</div>
    <div class="field"><label class="form-label">Tempat, tanggal lahir</label><input name="birth" value="${esc(existing?.birth||'')}" placeholder="Takalar, 13 Agustus 1990" required></div>
    <div class="field span-2"><label class="form-label">Alamat lengkap</label><textarea name="address" style="min-height:70px" placeholder="Dusun, RT/RW..." required>${esc(existing?.address||'')}</textarea></div>
    <div class="field"><label class="form-label">Status dalam keluarga</label>${comboboxHtml({ name:'family', readOnly:true, selectedValue: existing?.status||'Kepala Keluarga', options:[{value:'Kepala Keluarga',label:'Kepala Keluarga'},{value:'Istri',label:'Istri'},{value:'Anak',label:'Anak'},{value:'Lainnya',label:'Lainnya'}] })}</div>
    <div class="field"><label class="form-label">Nomor KK</label><input name="kk" maxlength="16" placeholder="16 digit nomor KK"></div>
  </div></div><div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Batal</button><button type="submit" class="btn btn-primary">${icon('check','sm')} ${existing?'Simpan perubahan':'Simpan data warga'}</button></div></form>`);
}

function openResidentDetail(resident) {
  openModal(`${modalHead('Detail warga','Data penduduk Desa Barugaya.','user')}<div class="modal-body"><div class="detail-list"><div class="detail-row"><span>NIK</span><strong>${esc(resident.nik)}</strong></div><div class="detail-row"><span>Nama lengkap</span><strong>${esc(resident.name)}</strong></div><div class="detail-row"><span>Jenis kelamin</span><strong>${esc(resident.gender)}</strong></div><div class="detail-row"><span>Tempat/Tgl lahir</span><strong>${esc(resident.birth)}</strong></div><div class="detail-row"><span>Alamat</span><strong>${esc(resident.address)}</strong></div><div class="detail-row"><span>Status keluarga</span><strong>${esc(resident.status)}</strong></div></div></div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button><button class="btn btn-primary" data-action="new-letter">${icon('mail','sm')} Buat surat</button></div>`);
}

function documentPaper(letter) {
  return `<div class="document-paper"><div class="doc-seal-row"><span class="doc-seal">T</span></div><div class="doc-body">${renderTemplateBody(letter)}</div></div>`;
}

function openLetterView(letter) {
  openModal(`${modalHead('Detail surat',`${letter.number} · ${letter.type}`,'file')}<div class="modal-body"><div class="review-grid"><div class="document-preview">${documentPaper(letter)}</div><div class="review-info"><h3>Informasi pengajuan</h3><div class="detail-list"><div class="detail-row"><span>ID surat</span><strong>${esc(letter.id)}</strong></div><div class="detail-row"><span>Nama warga</span><strong>${esc(letter.citizen)}</strong></div><div class="detail-row"><span>NIK</span><strong>${esc(letter.nik)}</strong></div><div class="detail-row"><span>Dikirim</span><strong>${esc(letter.updated)}</strong></div><div class="detail-row"><span>Status</span><strong>${statusBadge(letter.status)}</strong></div><div class="detail-row"><span>Catatan/alasan</span><strong>${esc(letter.reason)}</strong></div></div><div class="decision-box"><h4>Alur berikutnya</h4><p>${letter.status==='Disetujui'?'Surat sudah dicetak di kecamatan. Warga dapat mengambil dan menandatangani dokumen di loket.':letter.status==='Ditolak'?'Perbaiki kekurangan sesuai alasan penolakan, lalu ajukan kembali.':'Surat sedang dalam alur pemeriksaan Kecamatan Polongbangkeng Timur.'}</p></div></div></div></div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button><button class="btn btn-secondary" data-action="print-letter" data-id="${letter.id}">${icon('printer','sm')} Cetak pratinjau</button></div>`,'modal-xl');
}

function openReview(letter) {
  const actionable=['Terkirim','Diterima'].includes(letter.status);
  openModal(`<form id="decision-form" data-id="${letter.id}">${modalHead('Tinjau surat masuk',`${letter.village} · Dikirim ${letter.date}`,'eye')}<div class="modal-body"><div class="review-grid"><div class="document-preview">${documentPaper(letter)}</div><div class="review-info"><h3>Informasi pengajuan</h3><div class="detail-list"><div class="detail-row"><span>Nomor</span><strong>${esc(letter.number)}</strong></div><div class="detail-row"><span>Jenis surat</span><strong>${esc(letter.type)}</strong></div><div class="detail-row"><span>Asal desa</span><strong>${esc(letter.village)}</strong></div><div class="detail-row"><span>Nama warga</span><strong>${esc(letter.citizen)}</strong></div><div class="detail-row"><span>NIK</span><strong>${esc(letter.nik)}</strong></div><div class="detail-row"><span>Keperluan</span><strong>${esc(letter.purpose)}</strong></div><div class="detail-row"><span>Status</span><strong>${statusBadge(letter.status)}</strong></div></div>
    <div class="decision-box"><h4>Keputusan & alasan</h4><p>Setiap perubahan status wajib disertai alasan atau catatan untuk pihak desa.</p><div class="field" style="margin:0"><textarea name="reason" placeholder="Tulis hasil pemeriksaan atau alasan keputusan..." ${actionable?'required':''}>${actionable?'':esc(letter.reason)}</textarea></div></div></div></div></div>
    <div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Tutup</button>${actionable?`<button type="submit" name="decision" value="Ditolak" class="btn btn-danger-soft">${icon('x','sm')} Tolak</button>${letter.status==='Terkirim'?`<button type="submit" name="decision" value="Diterima" class="btn btn-secondary">${icon('mail','sm')} Terima berkas</button>`:''}<button type="submit" name="decision" value="Disetujui" class="btn btn-primary">${icon('check','sm')} Setujui</button>`:`<button type="button" class="btn btn-secondary" data-action="print-letter" data-id="${letter.id}">${icon('printer','sm')} Cetak surat</button>`}</div></form>`,'modal-xl');
}

function openTemplateEditor(type) {
  const t=state.templates[type]||{content:defaultTemplate(type)};
  openModal(`<form id="template-form" data-type="${type}">${modalHead(`Edit ${type}`,'Perubahan tersimpan sebagai template dan dapat dipakai berulang.','template')}<div class="modal-body"><label class="form-label">Isi template surat</label><div class="editor-toolbar"><button type="button" class="tool-btn" data-editor="bold">B</button><button type="button" class="tool-btn" data-editor="italic"><i>I</i></button><button type="button" class="tool-btn" data-editor="underline"><u>U</u></button><i class="tool-divider"></i><button type="button" class="tool-btn" data-insert="{{nama_warga}}">+ Nama</button><button type="button" class="tool-btn" data-insert="{{nik}}">+ NIK</button><button type="button" class="tool-btn" data-insert="{{alamat}}">+ Alamat</button><button type="button" class="tool-btn" data-insert="{{keperluan}}">+ Keperluan</button></div><textarea class="template-editor" name="content" id="template-editor">${esc(t.content)}</textarea><span class="helper">Variabel dalam tanda {{...}} akan diisi otomatis saat surat dibuat.</span></div><div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Batal</button><button type="button" class="btn btn-secondary" data-action="preview-template">${icon('eye','sm')} Pratinjau</button><button type="submit" class="btn btn-primary">${icon('check','sm')} Simpan template</button></div></form>`,'modal-lg');
}

function openAddAccount(existing=null,index='') {
  openModal(`<form id="account-form" data-index="${index}">${modalHead(existing?'Edit akun desa':'Buat akun desa',existing?'Perbarui akses akun desa.':'Akun desa hanya dapat dibuat oleh kecamatan.','user-plus')}<div class="modal-body"><div class="form-grid">
    <div class="field span-2"><label class="form-label">Nama desa</label><input name="name" value="${esc(existing?.name||'')}" placeholder="Contoh: Desa Pattinoang" required></div>
    <div class="field"><label class="form-label">Kecamatan</label>${comboboxHtml({ name:'district', readOnly:true, options:[{value:'Kec. Polongbangkeng Timur',label:'Kec. Polongbangkeng Timur'}] })}</div>
    <div class="field"><label class="form-label">Nama admin desa</label><input name="admin" value="${esc(existing?.admin||'')}" placeholder="Nama staf penanggung jawab" required></div>
    <div class="field"><label class="form-label">Username</label><input name="username" value="${esc(existing?.user||'')}" placeholder="Username unik" required></div>
    <div class="field"><label class="form-label">Kata sandi awal</label><input name="password" value="${esc(existing?.password||'Takalar@2026')}" required></div>
    <div class="field"><label class="form-label">Nomor WhatsApp</label><input name="phone" value="${esc(existing?.phone||'')}" placeholder="08xx xxxx xxxx" required></div>
    <div class="field"><label class="form-label">Jumlah warga awal</label><input name="residents" type="number" value="${existing?.residents||0}" min="0"></div>
    <div class="small-note span-2">${icon('shield','sm')} Kredensial dapat disalin setelah akun dibuat. Admin desa disarankan mengganti sandi pada login pertama.</div>
  </div></div><div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Batal</button><button type="submit" class="btn btn-primary">${icon('check','sm')} ${existing?'Simpan perubahan':'Buat akun desa'}</button></div></form>`);
}

function openVillageDetail(village) {
  const letters=state.incoming.filter(l=>l.village===village.name);
  openModal(`${modalHead(village.name,`${village.district} · Pantauan akun desa`,'village')}<div class="modal-body"><div class="stats-grid" style="grid-template-columns:1fr 1fr"><div class="stat-card"><div class="stat-top"><span class="stat-icon">${icon('users')}</span></div><div class="value">${village.residents.toLocaleString('id-ID')}</div><div class="label">Warga terdata</div></div><div class="stat-card"><div class="stat-top"><span class="stat-icon orange">${icon('mail')}</span></div><div class="value">${village.incoming}</div><div class="label">Surat masuk bulan ini</div></div></div><div class="detail-list mb-14"><div class="detail-row"><span>Admin desa</span><strong>${esc(village.admin)}</strong></div><div class="detail-row"><span>Username</span><strong>${esc(village.user)}</strong></div><div class="detail-row"><span>Kontak</span><strong>${esc(village.phone)}</strong></div><div class="detail-row"><span>Aktivitas</span><strong class="text-brand">Aktif ${esc(village.active)}</strong></div></div><h3 class="section-title">Surat terbaru dari desa</h3>${letters.length?recentTable(letters.slice(0,4),true):`<div class="small-note">Belum ada surat pada data demo.</div>`}</div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button><button class="btn btn-outline" data-action="edit-village" data-village="${village.name}">${icon('edit','sm')} Edit desa</button><button class="btn btn-primary" data-action="go-village-incoming" data-village="${village.name}">${icon('mail','sm')} Lihat surat masuk</button></div>`,'modal-lg');
}

function findLetter(id) { return [...state.incoming,...state.letters].find(l=>l.id===id); }
function findAccountIndexByVillage(name) { return state.accounts.findIndex(a=>a.name===name); }

// ===== Pencarian global di topbar =====
function setupGlobalSearch() {
  const wrap = $('.top-search'); if (!wrap) return;
  const input = wrap.querySelector('input[data-action="top-search"]'); if (!input) return;
  wrap.style.position = 'relative';
  const panel = document.createElement('div');
  panel.className = 'search-results'; panel.hidden = true;
  wrap.appendChild(panel);
  function run(qRaw) {
    const q = qRaw.trim().toLowerCase();
    if (!q || !state.role) { panel.hidden = true; panel.innerHTML=''; return; }
    const results = [];
    const letterPool = state.role === 'camat' ? state.incoming : state.letters;
    letterPool.forEach(l => { if (`${l.number} ${l.type} ${l.citizen} ${l.village||''}`.toLowerCase().includes(q)) results.push({ kind:'letter', id:l.id, title:l.number, sub:`${l.type} · ${l.citizen}` }); });
    if (state.role === 'desa') state.residents.forEach(r => { if (`${r.name} ${r.nik}`.toLowerCase().includes(q)) results.push({ kind:'resident', id:r.nik, title:r.name, sub:r.nik }); });
    else state.villages.forEach(v => { if (v.name.toLowerCase().includes(q)) results.push({ kind:'village', id:v.name, title:v.name, sub:v.district }); });
    const top = results.slice(0,6);
    panel.innerHTML = top.length ? top.map(r=>`<button type="button" class="search-result-item" data-kind="${r.kind}" data-rid="${esc(r.id)}">${icon(r.kind==='letter'?'mail':r.kind==='resident'?'user':'village','sm')}<span><strong>${esc(r.title)}</strong><span>${esc(r.sub)}</span></span></button>`).join('') : `<div class="search-empty">Tidak ada hasil untuk "${esc(qRaw)}"</div>`;
    panel.hidden = false;
  }
  input.addEventListener('input', () => run(input.value));
  input.addEventListener('focus', () => { if (input.value.trim()) run(input.value); });
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) panel.hidden = true; });
  panel.addEventListener('click', e => {
    const item = e.target.closest('.search-result-item'); if (!item) return;
    const { kind, rid } = item.dataset; panel.hidden = true; input.value = '';
    if (kind === 'letter') { const l = findLetter(rid); if (l) { state.page = state.role==='camat' ? 'incoming' : 'status'; renderApp(); state.role==='camat' ? openReview(l) : openLetterView(l); } }
    else if (kind === 'resident') { const r = state.residents.find(x=>x.nik===rid); if (r) { state.page='residents'; renderApp(); openResidentDetail(r); } }
    else if (kind === 'village') { const v = state.villages.find(x=>x.name===rid); if (v) { state.page='villages'; renderApp(); openVillageDetail(v); } }
  });
}

function openPreviewOverlay(letter) {
  const el = document.createElement('div');
  el.className = 'modal-backdrop preview-overlay';
  el.innerHTML = `<section class="modal modal-lg"><div class="modal-head"><span class="modal-title-icon">${icon('eye')}</span><div><h2>Pratinjau surat</h2><p>Tampilan dokumen sesuai template aktif saat ini.</p></div><button class="icon-btn" data-close-preview="1">${icon('x','sm')}</button></div><div class="modal-body">${documentPaper(letter)}</div></section>`;
  document.body.appendChild(el);
}
function printLetter(letter) {
  const win = window.open('', '_blank', 'width=480,height=700');
  if (!win) { window.print(); return; }
  win.document.write(`<!DOCTYPE html><html><head><title>${esc(letter.number)}</title><link rel="stylesheet" href="assets/css/styles.css"></head><body style="padding:24px;background:#fff"><script>window.onload=()=>{window.print();}<\/script>${documentPaper(letter)}</body></html>`);
  win.document.close();
}
function accountMenuModal(index) {
  const a = state.accounts[index];
  return `${modalHead('Kelola akun desa', a.name, 'user')}<div class="modal-body"><div class="detail-list mb-14"><div class="detail-row"><span>Admin desa</span><strong>${esc(a.admin)}</strong></div><div class="detail-row"><span>Username</span><strong>${esc(a.user)}</strong></div><div class="detail-row"><span>Status</span><strong>${esc(a.status)}</strong></div></div><div class="quick-actions">
    <button class="quick-action" data-action="account-toggle-status" data-index="${index}"><span class="stat-icon ${a.status==='Aktif'?'orange':''}">${icon(a.status==='Aktif'?'x':'check','sm')}</span><span><strong>${a.status==='Aktif'?'Nonaktifkan akun':'Aktifkan akun'}</strong><span>${a.status==='Aktif'?'Desa tidak bisa login sementara':'Desa dapat login kembali'}</span></span></button>
    <button class="quick-action" data-action="account-delete" data-index="${index}"><span class="stat-icon" style="color:#B8483C">${icon('x','sm')}</span><span><strong>Hapus akun</strong><span>Tindakan tidak dapat dibatalkan</span></span></button>
  </div></div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button></div>`;
}
function notificationsModal() {
  const pool = state.role==='camat' ? state.incoming : state.letters;
  const items = pool.slice(0,6);
  return `${modalHead('Notifikasi','Pembaruan surat terbaru.','bell')}<div class="modal-body">${items.length?`<div class="activity-list">${items.map(l=>`<button type="button" class="activity-item popover-btn" data-action="${state.role==='camat'?'review-letter':'view-letter'}" data-id="${l.id}"><span class="activity-icon">${icon('mail','sm')}</span><div class="activity-copy"><strong>${esc(l.number)} · ${esc(l.type)}</strong><p>${esc(l.citizen)} — ${statusBadge(l.status)}</p><time>${esc(l.updated)}</time></div></button>`).join('')}</div>`:`<div class="small-note">Belum ada notifikasi.</div>`}</div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button></div>`;
}
function helpModal() {
  return `${modalHead('Pusat bantuan','Hubungi tim dukungan Kecamatan Polongbangkeng Timur.','info')}<div class="modal-body"><div class="detail-list mb-14"><div class="detail-row"><span>Telepon</span><strong>(0418) 21001</strong></div><div class="detail-row"><span>Jam layanan</span><strong>Senin–Jumat, 08.00–16.00 WITA</strong></div></div><a class="btn btn-primary btn-block" href="https://wa.me/6281234421001" target="_blank" rel="noopener">${icon('send','sm')} Hubungi via WhatsApp</a></div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button></div>`;
}
function profileModal() {
  const account = state.role==='desa' ? state.accounts.find(a=>a.name===state.currentVillage) : null;
  return `<form id="password-form">${modalHead('Profil & keamanan', state.role==='camat'?'Admin Kecamatan Polongbangkeng Timur':(account?.name||'Desa'), 'user')}<div class="modal-body"><div class="detail-list mb-14"><div class="detail-row"><span>Peran</span><strong>${state.role==='camat'?'Camat / Admin Kecamatan':'Admin Desa'}</strong></div><div class="detail-row"><span>Username</span><strong>${state.role==='camat'?'polbangtimur':esc(account?.user||'-')}</strong></div></div><label class="form-label">Ganti kata sandi</label><div class="field has-icon"><span class="prefix">${icon('lock','sm')}</span><input name="password" type="password" placeholder="Kata sandi baru (min. 6 karakter)" minlength="6" required></div></div><div class="modal-foot"><button type="button" class="btn btn-outline" data-action="logout">${icon('logout','sm')} Keluar</button><button type="submit" class="btn btn-primary">${icon('check','sm')} Simpan sandi baru</button></div></form>`;
}
function openEditVillage(name) {
  const idx=findAccountIndexByVillage(name);
  if(idx===-1){ toast('Data akun tidak ditemukan','Desa ini belum memiliki akun terdaftar.','error'); return; }
  openAddAccount(state.accounts[idx], idx);
}

// Global interactions
document.addEventListener('click', e => {
  const closePreview = e.target.closest('[data-close-preview]');
  if (closePreview) { closePreview.closest('.preview-overlay')?.remove(); return; }
  if (e.target.classList?.contains('preview-overlay')) { e.target.remove(); return; }
  const el=e.target.closest('[data-action],[data-page],[data-editor],[data-insert]'); if(!el) return;
  if(el.dataset.page){ state.page=el.dataset.page; state.mobileOpen=false; renderApp(); return; }
  const action=el.dataset.action;
  if(action==='toggle-password'){ const p=$('#login-password'); p.type=p.type==='password'?'text':'password'; }
  else if(action==='forgot') toast('Hubungi administrator','Kecamatan dapat mereset kata sandi akun desa.');
  else if(action==='logout'){ closeModal(); state.role=null; state.page='dashboard'; state.mobileOpen=false; showView('login'); toast('Anda telah keluar','Sesi berakhir dengan aman.'); }
  else if(action==='open-mobile'){ state.mobileOpen=true; renderApp(); }
  else if(action==='close-mobile'){ state.mobileOpen=false; renderApp(); }
  else if(action==='close-modal'){ closeModal(); }
  else if(action==='backdrop' && e.target===el){ closeModal(); }
  else if(action==='new-letter'){ closeModal(); openNewLetter(el.dataset.type||''); }
  else if(action==='add-resident'){ openAddResident(); }
  else if(action==='edit-resident'){ openAddResident(state.residents.find(r=>r.nik===el.dataset.nik)); }
  else if(action==='view-resident'){ openResidentDetail(state.residents.find(r=>r.nik===el.dataset.nik)); }
  else if(action==='view-letter'){ closeModal(); openLetterView(findLetter(el.dataset.id)); }
  else if(action==='review-letter'){ closeModal(); openReview(findLetter(el.dataset.id)); }
  else if(action==='edit-template'){ openTemplateEditor(el.dataset.type); }
  else if(action==='add-account'){ openAddAccount(); }
  else if(action==='edit-account'){ openAddAccount(state.accounts[+el.dataset.index],el.dataset.index); }
  else if(action==='view-village'){ openVillageDetail(state.villages.find(v=>v.name===el.dataset.village)); }
  else if(action==='edit-village'){ openEditVillage(el.dataset.village); }
  else if(action==='go-village-incoming'){ closeModal(); state.page='incoming'; renderApp(); }
  else if(action==='copy-account'){ const a=state.accounts[+el.dataset.index]; if(navigator.clipboard) navigator.clipboard.writeText(`Username: ${a.user}\nPassword: ${a.password}`); toast('Kredensial disalin',`Akun ${a.name} siap dibagikan secara aman.`); }
  else if(action==='account-menu'){ openModal(accountMenuModal(+el.dataset.index)); }
  else if(action==='account-toggle-status'){
    const idx=+el.dataset.index; const a=state.accounts[idx]; a.status = a.status==='Aktif' ? 'Nonaktif' : 'Aktif';
    const v=state.villages.find(v=>v.user===a.user); if(v) v.status=a.status;
    persist(); closeModal(); renderApp(); toast('Status akun diperbarui',`${a.name} kini berstatus ${a.status}.`);
  }
  else if(action==='account-delete'){
    const idx=+el.dataset.index; const a=state.accounts[idx];
    if(!confirm(`Hapus akun ${a.name}? Desa ini tidak akan bisa login lagi ke sistem.`)) return;
    state.accounts.splice(idx,1); persist(); closeModal(); renderApp(); toast('Akun dihapus',`Akun ${a.name} telah dihapus dari sistem.`);
  }
  else if(action==='notifications'){ openModal(notificationsModal()); }
  else if(action==='help'){ openModal(helpModal()); }
  else if(action==='profile-menu'){ openModal(profileModal()); }
  else if(action==='refresh') {
    try {
      const fresh=JSON.parse(localStorage.getItem('lapoltimData')||'{}');
      Object.assign(state,{ letters: fresh.letters||state.letters, incoming: fresh.incoming||state.incoming, residents: fresh.residents||state.residents, villages: fresh.villages||state.villages, accounts: fresh.accounts||state.accounts, templates: fresh.templates||state.templates });
    } catch {}
    renderApp(); toast('Data tersinkron','Daftar sudah menggunakan data terbaru dari penyimpanan lokal perangkat ini.');
  }
  else if(action==='export'){ exportData(el.dataset.export || 'residents'); }
  else if(action==='paginate'){
    const scope=el.dataset.scope; state.pagination=state.pagination||{};
    const cur=state.pagination[scope]||1;
    if(el.dataset.num) state.pagination[scope]=+el.dataset.num;
    else if(el.dataset.dir==='prev') state.pagination[scope]=Math.max(1,cur-1);
    else if(el.dataset.dir==='next') state.pagination[scope]=cur+1;
    renderApp();
  }
  else if(action==='reset-filter'){
    const scope=el.dataset.scope; state.pagination=state.pagination||{};
    if(scope==='residents'){ state.residentSearch=''; state.residentDusun=''; state.residentGender=''; }
    if(scope==='incoming'){ state.incomingSearch=''; state.letterFilter='Semua'; state.villageFilter=''; }
    state.pagination[scope]=1; renderApp();
  }
  else if(action==='print-letter') { const l=findLetter(el.dataset.id); if(l) printLetter(l); else window.print(); }
  else if(action==='template-guide') toast('Panduan variabel','Variabel {{nama_warga}}, {{nik}}, {{alamat}}, {{tanggal}}, dan {{keperluan}} akan diisi otomatis.');
  else if(action==='preview-new-letter'){
    const form=document.getElementById('new-letter-form'); if(!form) return;
    const fd=new FormData(form);
    const resident=state.residents.find(r=>r.nik===fd.get('resident'));
    if(!resident || !fd.get('purpose')){ toast('Lengkapi data dulu','Pilih warga pemohon dan isi keperluan untuk melihat pratinjau.','error'); return; }
    openPreviewOverlay({ number:fd.get('number'), type:fd.get('type'), citizen:resident.name, nik:resident.nik, village:'Desa Barugaya', purpose:fd.get('purpose'), date:fd.get('date')||'13 Agu 2026' });
  }
  else if(action==='preview-template'){
    const form=document.getElementById('template-form'); const area=$('#template-editor'); if(!area||!form) return;
    const type=form.dataset.type; const backup=state.templates[type];
    state.templates[type]={ content: area.value, edited: backup?.edited };
    openPreviewOverlay({ number:'140/000/DB/VIII/2026', type, citizen:'Nama Warga Contoh', nik:'7305060000000000', village:'Desa Barugaya', purpose:'contoh keperluan surat', date:'13 Agu 2026' });
    state.templates[type]=backup;
  }
  else if(el.dataset.editor){
    const area=$('#template-editor'); if(!area) return;
    const marks={bold:'**',italic:'*',underline:'__'}[el.dataset.editor];
    const start=area.selectionStart, end=area.selectionEnd; const selected=area.value.slice(start,end)||'teks';
    area.value=area.value.slice(0,start)+marks+selected+marks+area.value.slice(end);
    area.focus(); area.selectionStart=start+marks.length; area.selectionEnd=start+marks.length+selected.length;
  }
  else if(action==='insert-variable' || el.dataset.insert){
    const area=$('#template-editor'); const text=el.dataset.insert; if(area){ const start=area.selectionStart; area.value=area.value.slice(0,start)+text+area.value.slice(area.selectionEnd); area.focus(); area.selectionStart=area.selectionEnd=start+text.length; }
  }
});

document.addEventListener('submit', e => {
  e.preventDefault(); const form=e.target; const fd=new FormData(form);
  if(form.id==='login-form'){
    const username=fd.get('username').trim(), password=fd.get('password');
    if(PORTAL==='camat'){
      if(username==='polbangtimur' && password===state.camatPassword){ state.role='camat'; state.page='dashboard'; renderApp(); toast('Selamat datang','Login Kecamatan Polongbangkeng Timur berhasil.'); }
      else toast('Login gagal','Username atau kata sandi camat tidak sesuai.','error');
    } else {
      const account=state.accounts.find(a=>a.user===username && a.password===password);
      if(!account) toast('Login gagal','Gunakan akun demo barugaya / desa123.','error');
      else if(account.status==='Nonaktif') toast('Akun nonaktif','Akun desa ini dinonaktifkan oleh kecamatan. Hubungi admin kecamatan.','error');
      else { state.role='desa'; state.currentVillage=account.name; state.page='dashboard'; renderApp(); toast('Selamat datang',`Login ${account.name} berhasil.`); }
    }
  }
  if(form.id==='password-form'){
    const password=fd.get('password');
    if(state.role==='camat'){ state.camatPassword=password; }
    else { const account=state.accounts.find(a=>a.name===state.currentVillage); if(account) account.password=password; }
    persist(); closeModal(); toast('Sandi diperbarui','Gunakan kata sandi baru pada login berikutnya.');
  }
  if(form.id==='new-letter-form'){
    const resident=state.residents.find(r=>r.nik===fd.get('resident'));
    if(!resident){ toast('Data belum lengkap','Silakan pilih warga pemohon.','error'); return; }
    const l={ id:`SRT-0826-${uid().slice(0,3)}`, number:fd.get('number'), type:fd.get('type'), citizen:resident.name, nik:resident.nik, village:'Desa Barugaya', purpose:fd.get('purpose'), date:'13 Agu 2026', status:'Terkirim', reason:'Menunggu pemeriksaan kelengkapan oleh petugas kecamatan.', updated:'13 Agu 2026, 09:48' };
    state.letters.unshift(l); state.incoming.unshift({...l}); const v=state.villages.find(v=>v.name==='Desa Barugaya'); if(v) v.incoming++; persist(); closeModal(); state.page='status'; renderApp(); toast('Surat berhasil dikirim',`${l.type} untuk ${l.citizen} masuk antrean kecamatan.`);
  }
  if(form.id==='resident-form'){
    const nik=fd.get('nik').trim(); let r=state.residents.find(r=>r.nik===nik);
    const data={nik,name:fd.get('name'),gender:fd.get('gender'),birth:fd.get('birth'),address:fd.get('address'),status:fd.get('family')};
    if(r) Object.assign(r,data); else { state.residents.unshift(data); }
    persist(); closeModal(); if(state.page==='residents') renderApp(); toast(r?'Data diperbarui':'Warga berhasil ditambahkan',`${data.name} tersimpan di data penduduk desa.`);
  }
  if(form.id==='template-form'){
    const type=form.dataset.type; state.templates[type]={content:fd.get('content'),edited:'13 Agu 2026, 09:48'}; persist(); closeModal(); renderApp(); toast('Template berhasil disimpan',`${type} siap digunakan berulang kali.`);
  }
  if(form.id==='decision-form'){
    const submitter=e.submitter; const decision=submitter?.value; const reason=fd.get('reason').trim();
    if(!reason){ toast('Alasan wajib diisi','Tuliskan catatan pemeriksaan sebelum memberi keputusan.','error'); return; }
    const l=state.incoming.find(x=>x.id===form.dataset.id); if(!l) return;
    l.status=decision; l.reason=reason; l.updated='13 Agu 2026, 09:48';
    const local=state.letters.find(x=>x.id===l.id); if(local) Object.assign(local,{status:decision,reason,updated:l.updated});
    persist(); closeModal(); renderApp(); toast(`Surat ${decision.toLowerCase()}`,`Keputusan untuk ${l.village} berhasil dikirim.`);
  }
  if(form.id==='account-form'){
    const idx=form.dataset.index; const data={name:fd.get('name'),district:fd.get('district'),admin:fd.get('admin'),user:fd.get('username'),password:fd.get('password'),phone:fd.get('phone'),residents:+fd.get('residents')||0};
    if(idx!==''){
      const oldUser=state.accounts[+idx].user;
      Object.assign(state.accounts[+idx],data);
      const v=state.villages.find(v=>v.user===oldUser);
      if(v) Object.assign(v,data);
    } else {
      const newRecord={...data,incoming:0,active:'Baru dibuat',status:'Aktif',created:'13 Agu 2026'};
      state.accounts.push(newRecord); state.villages.push({...newRecord});
    }
    persist(); closeModal(); if(state.page==='accounts'||state.page==='villages') renderApp(); toast(idx!==''?'Data desa diperbarui':'Akun desa berhasil dibuat',`${data.name} dapat login dengan username ${data.user}.`);
  }
});

document.addEventListener('change', e => {
  const id = e.target.id; const resetPage = scope => { state.pagination = state.pagination || {}; state.pagination[scope] = 1; };
  if(id==='status-filter'){ state.statusFilter=e.target.value; resetPage('status'); renderApp(); }
  else if(id==='status-month'){ state.statusMonth=e.target.value; resetPage('status'); renderApp(); }
  else if(id==='incoming-filter'){ state.letterFilter=e.target.value; resetPage('incoming'); renderApp(); }
  else if(id==='village-filter'){ state.villageFilter=e.target.value; resetPage('incoming'); renderApp(); }
  else if(id==='dusun-filter'){ state.residentDusun=e.target.value; resetPage('residents'); renderApp(); }
  else if(id==='gender-filter'){ state.residentGender=e.target.value; resetPage('residents'); renderApp(); }
  else if(id==='history-status-filter'){ state.historyStatusFilter=e.target.value; resetPage('history'); renderApp(); }
  else if(id==='history-village-filter'){ state.historyVillageFilter=e.target.value; resetPage('history'); renderApp(); }
  else if(id==='history-month'){ state.historyMonth=e.target.value; resetPage('history'); renderApp(); }
  else if(id==='village-status-filter'){ state.villageStatusFilter=e.target.value; resetPage('villages'); renderApp(); }
  else if(id==='account-status-filter'){ state.accountStatusFilter=e.target.value; renderApp(); }
});

document.addEventListener('input', e => {
  const id = e.target.id;
  const debounced = (key, scope) => { state[key]=e.target.value; clearTimeout(window[`_t_${key}`]); window[`_t_${key}`]=setTimeout(()=>{ if(scope){ state.pagination=state.pagination||{}; state.pagination[scope]=1; } renderApp(); },300); };
  if(id==='inventory-search') { const q=e.target.value.toLowerCase(); $$('.letter-card[data-letter-name]').forEach(c=>c.style.display=c.dataset.letterName.includes(q)?'':'none'); }
  else if(id==='resident-search') debounced('residentSearch','residents');
  else if(id==='status-search') debounced('statusSearch','status');
  else if(id==='incoming-search') debounced('incomingSearch','incoming');
  else if(id==='history-search') debounced('historySearch','history');
  else if(id==='village-search') debounced('villageSearch','villages');
  else if(id==='account-search') debounced('accountSearch',null);
});

setupGlobalSearch();
showView("login");
