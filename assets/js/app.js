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
  { nik:'7305061205890001', name:'Muh. Akbar', gender:'Laki-laki', birth:'Takalar, 12 Mei 1989', address:'Dusun Bontoloe, RT 001/RW 002', status:'Kepala Keluarga' },
  { nik:'7305064506920003', name:'Nur Aisyah', gender:'Perempuan', birth:'Takalar, 5 Juni 1992', address:'Dusun Bontoloe, RT 002/RW 002', status:'Istri' },
  { nik:'7305060301750002', name:'H. Jamaluddin', gender:'Laki-laki', birth:'Gowa, 3 Januari 1975', address:'Dusun Panaikang, RT 001/RW 003', status:'Kepala Keluarga' },
  { nik:'7305065110950004', name:'Sri Wahyuni', gender:'Perempuan', birth:'Takalar, 11 Oktober 1995', address:'Dusun Panaikang, RT 003/RW 003', status:'Kepala Keluarga' },
  { nik:'7305061808820005', name:'Baharuddin', gender:'Laki-laki', birth:'Jeneponto, 18 Agustus 1982', address:'Dusun Bontomanai, RT 001/RW 004', status:'Kepala Keluarga' },
  { nik:'7305066712000007', name:'Nurul Hikmah', gender:'Perempuan', birth:'Takalar, 27 Desember 2000', address:'Dusun Bontomanai, RT 002/RW 004', status:'Anak' },
  { nik:'7305061404870008', name:'Andi Fadli', gender:'Laki-laki', birth:'Makassar, 14 April 1987', address:'Dusun Bontoloe, RT 004/RW 002', status:'Kepala Keluarga' },
  { nik:'7305064909780009', name:'Hj. Rosmiati', gender:'Perempuan', birth:'Takalar, 9 Juli 1978', address:'Dusun Panaikang, RT 002/RW 003', status:'Kepala Keluarga' }
];

const seedLetters = [
  { id:'SRT-0826-031', number:'140/031/DB/VIII/2026', type:'Surat Permohonan', citizen:'Muh. Akbar', nik:'7305061205890001', village:'Desa Bontoloe', purpose:'Permohonan rekomendasi izin usaha', date:'12 Agu 2026', status:'Terkirim', reason:'Menunggu pemeriksaan kelengkapan oleh petugas kecamatan.', updated:'12 Agu 2026, 14:32' },
  { id:'SRT-0826-030', number:'470/030/DB/VIII/2026', type:'Surat Keterangan', citizen:'Nur Aisyah', nik:'7305064506920003', village:'Desa Bontoloe', purpose:'Keterangan domisili untuk administrasi bank', date:'11 Agu 2026', status:'Diterima', reason:'Berkas telah diterima dan masuk antrean peninjauan.', updated:'12 Agu 2026, 09:15' },
  { id:'SRT-0826-028', number:'005/028/DB/VIII/2026', type:'Surat Undangan', citizen:'H. Jamaluddin', nik:'7305060301750002', village:'Desa Bontoloe', purpose:'Undangan musyawarah tingkat kecamatan', date:'10 Agu 2026', status:'Disetujui', reason:'Dokumen valid. Surat telah dicetak dan siap diambil di loket kecamatan.', updated:'11 Agu 2026, 13:40' },
  { id:'SRT-0826-025', number:'145/025/DB/VIII/2026', type:'Surat Kuasa', citizen:'Sri Wahyuni', nik:'7305065110950004', village:'Desa Bontoloe', purpose:'Kuasa pengurusan dokumen pertanahan', date:'8 Agu 2026', status:'Ditolak', reason:'Salinan identitas penerima kuasa belum dilampirkan. Silakan lengkapi lalu ajukan kembali.', updated:'9 Agu 2026, 10:20' },
  { id:'SRT-0826-022', number:'140/022/DB/VIII/2026', type:'Surat Permohonan', citizen:'Baharuddin', nik:'7305061808820005', village:'Desa Bontoloe', purpose:'Permohonan bantuan sarana pertanian', date:'6 Agu 2026', status:'Disetujui', reason:'Usulan sesuai hasil verifikasi dan surat siap ditandatangani.', updated:'7 Agu 2026, 15:05' },
  { id:'SRT-0826-019', number:'100/019/DB/VIII/2026', type:'Surat Keputusan', citizen:'Andi Fadli', nik:'7305061404870008', village:'Desa Bontoloe', purpose:'Penetapan pengurus kelompok tani', date:'4 Agu 2026', status:'Diterima', reason:'Dokumen diterima, menunggu verifikasi pejabat terkait.', updated:'5 Agu 2026, 08:55' },
  { id:'SRT-0726-117', number:'003/117/DB/VII/2026', type:'Surat Edaran', citizen:'Hj. Rosmiati', nik:'7305064909780009', village:'Desa Bontoloe', purpose:'Edaran kerja bakti lingkungan', date:'29 Jul 2026', status:'Disetujui', reason:'Naskah telah sesuai dan disetujui untuk diterbitkan.', updated:'30 Jul 2026, 11:15' }
];

const seedVillages = [
  { name:'Desa Bontoloe', district:'Kec. Galesong', residents:1284, incoming:8, admin:'Rahmat Hidayat', user:'bontoloe', phone:'0821 4455 9021', active:'2 menit lalu' },
  { name:'Desa Bontomarannu', district:'Kec. Galesong Selatan', residents:1645, incoming:12, admin:'Nur Khaerunnisa', user:'bontomarannu', phone:'0852 9912 4053', active:'8 menit lalu' },
  { name:'Desa Pa’lalakkang', district:'Kec. Galesong', residents:2110, incoming:5, admin:'Hasan Basri', user:'palalakkang', phone:'0813 5519 0032', active:'21 menit lalu' },
  { name:'Desa Aeng Towa', district:'Kec. Galesong Utara', residents:1892, incoming:9, admin:'Andi Syahrir', user:'aengtowa', phone:'0823 4637 8110', active:'35 menit lalu' },
  { name:'Desa Tamalate', district:'Kec. Galesong Utara', residents:2036, incoming:3, admin:'Muh. Ilyas', user:'tamalate', phone:'0853 9990 7124', active:'1 jam lalu' },
  { name:'Desa Boddia', district:'Kec. Galesong', residents:1478, incoming:7, admin:'Syarifuddin', user:'boddia', phone:'0812 8033 1187', active:'1 jam lalu' },
  { name:'Desa Popo', district:'Kec. Galesong Selatan', residents:1159, incoming:2, admin:'Ruslan Dg. Naba', user:'popo', phone:'0852 4306 1501', active:'3 jam lalu' },
  { name:'Desa Mangindara', district:'Kec. Galesong Selatan', residents:1236, incoming:4, admin:'Sri Rahayu', user:'mangindara', phone:'0813 6781 3220', active:'Kemarin' }
];

const otherIncoming = [
  { id:'SRT-0826-044', number:'140/044/BT/VIII/2026', type:'Surat Permohonan', citizen:'Sitti Aminah', nik:'7305065301900007', village:'Desa Bontomarannu', purpose:'Permohonan rekomendasi bantuan UMKM', date:'13 Agu 2026', status:'Terkirim', reason:'Menunggu pemeriksaan awal oleh petugas kecamatan.', updated:'13 Agu 2026, 09:42' },
  { id:'SRT-0826-043', number:'470/043/PL/VIII/2026', type:'Surat Keterangan', citizen:'M. Ridwan', nik:'7305061911830004', village:'Desa Pa’lalakkang', purpose:'Keterangan usaha perdagangan', date:'13 Agu 2026', status:'Terkirim', reason:'Menunggu pemeriksaan awal oleh petugas kecamatan.', updated:'13 Agu 2026, 08:55' },
  { id:'SRT-0826-041', number:'005/041/AT/VIII/2026', type:'Surat Undangan', citizen:'Darmawati', nik:'7305064809880002', village:'Desa Aeng Towa', purpose:'Undangan rapat koordinasi stunting', date:'12 Agu 2026', status:'Diterima', reason:'Berkas diterima petugas dan sedang ditinjau.', updated:'12 Agu 2026, 16:15' },
  { id:'SRT-0826-039', number:'145/039/TM/VIII/2026', type:'Surat Kuasa', citizen:'H. Sahabuddin', nik:'7305060402700001', village:'Desa Tamalate', purpose:'Kuasa pengambilan bantuan sosial', date:'12 Agu 2026', status:'Terkirim', reason:'Menunggu pemeriksaan awal oleh petugas kecamatan.', updated:'12 Agu 2026, 13:02' },
  { id:'SRT-0826-037', number:'100/037/BD/VIII/2026', type:'Surat Keputusan', citizen:'Nurhayati', nik:'7305066207850005', village:'Desa Boddia', purpose:'Penetapan kader posyandu', date:'11 Agu 2026', status:'Disetujui', reason:'Data telah diverifikasi. Dokumen siap dicetak dan ditandatangani.', updated:'12 Agu 2026, 10:10' },
  { id:'SRT-0826-035', number:'003/035/PP/VIII/2026', type:'Surat Edaran', citizen:'Abdul Rahman', nik:'7305062106810006', village:'Desa Popo', purpose:'Edaran kebersihan saluran air', date:'10 Agu 2026', status:'Ditolak', reason:'Tujuan surat perlu diperjelas dan daftar penerima belum dicantumkan.', updated:'11 Agu 2026, 09:20' }
];

const defaultTemplate = type => `PEMERINTAH KABUPATEN TAKALAR\nKECAMATAN GALESONG\nDESA BONTOLOE\nAlamat: Jl. Poros Galesong, Kabupaten Takalar\n\n${type.toUpperCase()}\nNomor: {{nomor_surat}}\n\nYang bertanda tangan di bawah ini, Pemerintah Desa Bontoloe, menerangkan bahwa:\n\nNama            : {{nama_warga}}\nNIK             : {{nik}}\nTempat/Tgl Lahir: {{tempat_tanggal_lahir}}\nAlamat          : {{alamat}}\n\nDengan ini menerangkan bahwa surat ini dibuat untuk keperluan {{keperluan}} dan ditujukan kepada Pemerintah Kecamatan.\n\nDemikian surat ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.\n\nBontoloe, {{tanggal}}\nKepala Desa Bontoloe\n\n\n\n(____________________)`;

const stored = (() => { try { return JSON.parse(localStorage.getItem('sapaTakalarData') || '{}'); } catch { return {}; } })();
const state = {
  role: null,
  loginRole: PORTAL,
  page: 'dashboard',
  mobileOpen: false,
  statusFilter: 'Semua',
  letterFilter: 'Semua',
  residentSearch: '',
  letters: stored.letters || seedLetters,
  incoming: stored.incoming || [...otherIncoming, ...seedLetters],
  residents: stored.residents || seedResidents,
  residentTotal: stored.residentTotal || 1284,
  villages: stored.villages || seedVillages,
  accounts: stored.accounts || seedVillages.map((v,i) => ({...v, password:i===0?'desa123':'Takalar@2026', status:'Aktif', created: i < 4 ? '12 Jan 2026' : '18 Mar 2026'})),
  templates: stored.templates || Object.fromEntries(LETTER_TYPES.map(t => [t.name, { content: defaultTemplate(t.name), edited:'10 Agu 2026, 09:30' }])),
  currentVillage: 'Desa Bontoloe'
};

function persist() {
  localStorage.setItem('sapaTakalarData', JSON.stringify({
    letters: state.letters, incoming: state.incoming, residents: state.residents,
    residentTotal: state.residentTotal, villages: state.villages,
    accounts: state.accounts, templates: state.templates
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

function renderLogin() {
  const isDesa = PORTAL === 'desa';
  $('#app').innerHTML = `<main class="portal-login ${isDesa?'portal-login-desa':'portal-login-camat'}">
    <section class="portal-login-form">
      <div class="login-form-wrap">
        <a class="brand" href="index.html"><img class="brand-logo" src="assets/images/icon.png" alt="Logo SAPA Takalar"><span class="brand-word">SAPA <small>TAKALAR</small></span></a>
        <a class="back-link" href="index.html">${icon('arrow-left','sm')} Kembali ke pilihan portal</a>
        <div class="login-heading">
          <span class="section-kicker">${isDesa?'Akses perangkat desa':'Akses pemerintah kecamatan'}</span>
          <h1>Masuk Portal ${isDesa?'Desa':'Kecamatan'}</h1>
          <p>${isDesa?'Kelola data warga dan pengajuan surat Desa Bontoloe.':'Tinjau surat masuk dan pantau pelayanan seluruh desa.'}</p>
        </div>
        <form class="login-form" id="login-form">
          <label class="form-label">Username</label>
          <div class="field has-icon"><span class="prefix">${icon('user','sm')}</span><input name="username" autocomplete="username" placeholder="Masukkan username" value="${isDesa?'bontoloe':'takalar'}" required></div>
          <label class="form-label">Kata sandi</label>
          <div class="field has-icon"><span class="prefix">${icon('lock','sm')}</span><input id="login-password" name="password" type="password" autocomplete="current-password" placeholder="Masukkan kata sandi" value="${isDesa?'desa123':'takalarcepat'}" required><button type="button" class="password-toggle" data-action="toggle-password">${icon('eye','sm')}</button></div>
          <div class="login-meta"><label class="checkbox"><input type="checkbox" checked> Ingat saya</label><button type="button" class="text-link" data-action="forgot">Lupa kata sandi?</button></div>
          <button class="btn ${isDesa?'btn-primary':'btn-dark'} btn-block" type="submit">Masuk ke sistem ${icon('chevron-right','sm')}</button>
          <div class="login-hint">${icon('info','sm')} <span>${isDesa?'<b>Akun demo:</b> bontoloe / desa123':'<b>Akun camat:</b> takalar / takalarcepat'}</span></div>
        </form>
        <p class="login-help">Mengalami kendala akses? Hubungi administrator Kecamatan Takalar.</p>
      </div>
    </section>
    <section class="portal-login-visual">
      <div class="login-visual-copy"><span>${isDesa?'PORTAL DESA':'PORTAL KECAMATAN'}</span><h2>${isDesa?'Administrasi desa yang tertata.':'Pemantauan layanan yang terpusat.'}</h2><p>${isDesa?'Buat surat dari data warga, kirim ke kecamatan, dan ikuti prosesnya.':'Periksa usulan dari desa, berikan keputusan, dan pantau data pelayanan.'}</p></div>
      <img src="assets/images/${isDesa?'login-desa.svg':'login-camat.svg'}" alt="Ilustrasi ${isDesa?'kantor desa':'kantor kecamatan'}">
      <div class="visual-file-note">Gambar: <code>assets/images/${isDesa?'login-desa.svg':'login-camat.svg'}</code></div>
    </section>
  </main>`;
}

const navs = {
  desa: [
    ['dashboard','home','Beranda',''], ['inventory','mail','Inventaris Surat','7'], ['residents','users','Data Warga',''],
    ['status','send','Status Surat','4'], ['templates','template','Template Surat',''], ['history','history','Riwayat','']
  ],
  camat: [
    ['dashboard','home','Beranda',''], ['incoming','mail','Surat Masuk','8'], ['villages','village','Daftar Desa','8'],
    ['accounts','user-plus','Akun Desa',''], ['history','history','Riwayat','']
  ]
};
const pageTitles = { dashboard:'Beranda', inventory:'Inventaris Surat', residents:'Data Warga', status:'Status Surat', templates:'Template Surat', history:'Riwayat', incoming:'Surat Masuk', villages:'Daftar Desa', accounts:'Akun Desa' };

function renderApp() {
  const role = state.role;
  const roleDesa = role === 'desa';
  const navHtml = navs[role].map(([id,ic,label,badge]) => `<button class="nav-item ${state.page===id?'active':''}" data-page="${id}">${icon(ic)}<span>${label}</span>${badge?`<span class="nav-badge">${badge}</span>`:''}</button>`).join('');
  $('#app').innerHTML = `<div class="app-shell">
    ${state.mobileOpen?'<div class="mobile-overlay" data-action="close-mobile"></div>':''}
    <aside class="sidebar ${state.mobileOpen?'open':''}">
      <div class="brand"><img class="brand-logo" src="assets/images/icon.png" alt="Logo SAPA"><span class="brand-word">SAPA <small>TAKALAR</small></span></div>
      <div class="sidebar-context"><span class="context-icon">${icon(roleDesa?'village':'building','sm')}</span><span><strong>${roleDesa?'Desa Bontoloe':'Kecamatan Takalar'}</strong><span>${roleDesa?'Kec. Galesong':'Portal pengawasan'}</span></span></div>
      <div class="nav-label">Menu utama</div><nav class="nav">${navHtml}</nav>
      <div class="nav-spacer"></div>
      <div class="support-card"><strong>Butuh bantuan?</strong><p>Tim dukungan siap membantu kendala layanan Anda.</p><button data-action="help">Hubungi dukungan</button></div>
      <div class="sidebar-profile"><span class="avatar ${roleDesa?'':'green'}">${roleDesa?'RH':'CT'}</span><span class="profile-copy"><strong>${roleDesa?'Rahmat Hidayat':'Admin Kecamatan'}</strong><span>${roleDesa?'Staf Pelayanan':'Camat Takalar'}</span></span><button class="icon-btn" data-action="profile-menu">${icon('more','sm')}</button></div>
    </aside>
    <div class="main-wrap">
      <header class="topbar"><button class="icon-btn mobile-menu" data-action="open-mobile">${icon('menu')}</button><div class="page-crumb"><span>SAPA / ${roleDesa?'Portal Desa':'Portal Kecamatan'}</span><strong>${pageTitles[state.page]}</strong></div>
        <div class="top-search"><span>${icon('search','sm')}</span><input placeholder="Cari surat, warga, atau desa..." data-action="top-search"></div>
        <div class="top-actions"><button class="icon-btn notification-btn" data-action="notifications">${icon('bell','sm')}</button><div class="top-date"><strong>Kamis, 13 Agustus 2026</strong>09:48 WITA</div><button class="icon-btn" data-action="logout" title="Keluar">${icon('logout','sm')}</button></div>
      </header>
      <main class="content">${renderPage()}</main>
    </div>
  </div>`;
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
  return `${pageHeader('Selamat datang, Rahmat','Berikut ringkasan layanan administrasi Desa Bontoloe hari ini.',`<button class="btn btn-primary" data-action="new-letter">${icon('plus','sm')} Buat surat baru</button>`)}
    <section class="welcome-banner"><div class="welcome-copy"><span class="mini">Pelayanan desa digital</span><h2>Layani warga lebih cepat hari ini.</h2><p>Buat usulan surat, kirim ke kecamatan, lalu pantau prosesnya secara transparan tanpa berkas berulang.</p><button class="btn" data-page="inventory">Mulai buat surat ${icon('chevron-right','sm')}</button></div><div class="banner-art"><img src="assets/images/banner-desa.svg" alt="Ilustrasi kantor desa"></div></section>
    <div class="stats-grid">${statCard('users','Total warga terdata',state.residentTotal.toLocaleString('id-ID'),'+4.2%')}${statCard('file','Surat bulan ini','32','+12%', 'blue')}${statCard('clock','Menunggu proses',counts['Terkirim']+counts['Diterima'],'-2.1%', 'orange')}${statCard('check','Surat disetujui','24','+8.4%', 'purple')}</div>
    <div class="dashboard-grid"><div>
      <section class="panel mb-14"><div class="panel-head"><div><h3>Aksi cepat</h3><p>Akses layanan yang sering digunakan</p></div></div><div class="panel-body"><div class="quick-actions">
        <button class="quick-action" data-action="new-letter"><span class="stat-icon">${icon('plus','sm')}</span><span><strong>Buat surat</strong><span>Ajukan surat warga</span></span></button>
        <button class="quick-action" data-action="add-resident"><span class="stat-icon blue">${icon('user-plus','sm')}</span><span><strong>Tambah warga</strong><span>Input data penduduk</span></span></button>
        <button class="quick-action" data-page="status"><span class="stat-icon orange">${icon('history','sm')}</span><span><strong>Lacak surat</strong><span>Pantau status usulan</span></span></button>
      </div></div></section>
      <section class="panel"><div class="panel-head"><div><h3>Surat terbaru</h3><p>Usulan surat yang terakhir diperbarui</p></div><button class="see-all" data-page="status">Lihat semua ${icon('chevron-right','sm')}</button></div>${recentTable(state.letters.slice(0,5))}</section>
    </div><div>
      <section class="panel mb-14"><div class="panel-head"><div><h3>Ringkasan status</h3><p>Progres surat bulan Agustus</p></div><span class="badge approved">Aktif</span></div><div class="panel-body"><div class="status-list">
        ${statusProgress('Disetujui',counts['Disetujui'],52,'')}${statusProgress('Diterima',counts['Diterima'],28,'blue')}${statusProgress('Terkirim',counts['Terkirim'],18,'orange')}${statusProgress('Ditolak',counts['Ditolak'],10,'red')}
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
function activity(ic,title,text,time) { return `<div class="activity-item"><span class="activity-icon">${icon(ic,'sm')}</span><div class="activity-copy"><strong>${title}</strong><p>${text}</p><time>${time}</time></div></div>`; }
function countStatuses(items) { return ['Terkirim','Diterima','Disetujui','Ditolak'].reduce((a,s)=>(a[s]=items.filter(x=>x.status===s).length,a),{}); }
function statusBadge(status) { const c={Terkirim:'sent',Diterima:'received',Disetujui:'approved',Ditolak:'rejected'}[status]||'sent'; return `<span class="badge ${c}">${status}</span>`; }

function renderInventory() {
  const counts = Object.fromEntries(LETTER_TYPES.map(t=>[t.name,state.letters.filter(l=>l.type===t.name).length]));
  return `${pageHeader('Inventaris Surat','Pilih jenis surat yang ingin dibuat dan diajukan ke kecamatan.',`<button class="btn btn-outline" data-page="templates">${icon('template','sm')} Kelola template</button><button class="btn btn-primary" data-action="new-letter">${icon('plus','sm')} Buat surat</button>`)}
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search','sm')}</span><input id="inventory-search" placeholder="Cari jenis surat..."></div><div class="toolbar-spacer"></div><span class="small-note">${icon('info','sm')} 7 template siap digunakan</span></div>
    <div class="inventory-grid" id="inventory-grid">${LETTER_TYPES.map(t=>`<article class="letter-card color-${t.color}" data-letter-name="${t.name.toLowerCase()}"><div class="letter-card-top"><span class="letter-icon">${icon(t.icon,'lg')}</span><span class="template-ready">${icon('check','sm')} Template aktif</span></div><h3>${t.name}</h3><p>${t.desc}</p><div class="letter-meta"><span>${counts[t.name]||0} surat dibuat</span><button class="btn btn-sm btn-secondary" data-action="new-letter" data-type="${t.name}">Buat surat ${icon('chevron-right','sm')}</button></div></article>`).join('')}</div>`;
}

function renderResidents() {
  const filtered = state.residents.filter(r=>`${r.name} ${r.nik} ${r.address}`.toLowerCase().includes(state.residentSearch.toLowerCase()));
  return `${pageHeader('Data Warga','Kelola data penduduk Desa Bontoloe sebagai sumber pengisian surat.',`<button class="btn btn-outline" data-action="export">${icon('download','sm')} Ekspor data</button><button class="btn btn-primary" data-action="add-resident">${icon('user-plus','sm')} Tambah warga</button>`)}
    <div class="stats-grid">${statCard('users','Total penduduk',state.residentTotal.toLocaleString('id-ID'),'+12')}${statCard('user','Laki-laki','648','50.5%','blue')}${statCard('user','Perempuan','636','49.5%','purple')}${statCard('home','Kepala keluarga','382','+3','orange')}</div>
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search','sm')}</span><input id="resident-search" value="${esc(state.residentSearch)}" placeholder="Cari nama atau NIK..."></div><select class="toolbar-select"><option>Semua dusun</option><option>Dusun Bontoloe</option><option>Dusun Panaikang</option><option>Dusun Bontomanai</option></select><select class="toolbar-select"><option>Semua jenis kelamin</option><option>Laki-laki</option><option>Perempuan</option></select><div class="toolbar-spacer"></div><button class="btn btn-sm btn-outline">${icon('filter','sm')} Filter</button></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>NIK</th><th>Nama warga</th><th>Jenis kelamin</th><th>Tempat, tanggal lahir</th><th>Alamat</th><th>Status keluarga</th><th></th></tr></thead><tbody>${filtered.map((r,i)=>`<tr><td class="primary">${esc(r.nik)}</td><td><div class="table-user"><span class="avatar ${i%2?'green':''}">${initials(r.name)}</span><span class="primary">${esc(r.name)}</span></div></td><td>${esc(r.gender)}</td><td>${esc(r.birth)}</td><td>${esc(r.address)}</td><td>${esc(r.status)}</td><td><div class="table-actions"><button class="icon-btn" data-action="view-resident" data-nik="${r.nik}">${icon('eye','sm')}</button><button class="icon-btn" data-action="edit-resident" data-nik="${r.nik}">${icon('edit','sm')}</button></div></td></tr>`).join('')}</tbody></table><div class="pagination"><span>Menampilkan ${filtered.length} dari ${state.residentTotal.toLocaleString('id-ID')} warga</span><div class="page-buttons"><button class="page-btn">‹</button><button class="page-btn active">1</button><button class="page-btn">2</button><button class="page-btn">3</button><button class="page-btn">›</button></div></div></div>`;
}
function initials(name) { return name.replace(/[^A-Za-zÀ-ÿ ]/g,'').split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase() || 'WG'; }

function renderStatus() {
  const counts=countStatuses(state.letters);
  const filtered=state.statusFilter==='Semua'?state.letters:state.letters.filter(l=>l.status===state.statusFilter);
  return `${pageHeader('Status Surat','Pantau progres setiap usulan beserta catatan atau alasan dari kecamatan.',`<button class="btn btn-primary" data-action="new-letter">${icon('plus','sm')} Buat surat baru</button>`)}
    <div class="status-summary">${statusMini('Terkirim',counts.Terkirim,'blue')}${statusMini('Diterima',counts.Diterima,'orange')}${statusMini('Disetujui',counts.Disetujui,'')}${statusMini('Ditolak',counts.Ditolak,'red')}</div>
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search','sm')}</span><input placeholder="Cari nomor, jenis, atau warga..."></div><select class="toolbar-select" id="status-filter"><option ${state.statusFilter==='Semua'?'selected':''}>Semua</option>${['Terkirim','Diterima','Disetujui','Ditolak'].map(s=>`<option ${state.statusFilter===s?'selected':''}>${s}</option>`).join('')}</select><select class="toolbar-select"><option>Agustus 2026</option><option>Juli 2026</option></select><div class="toolbar-spacer"></div><button class="btn btn-sm btn-outline">${icon('download','sm')} Unduh laporan</button></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>Nomor / Jenis</th><th>Nama warga</th><th>Tanggal</th><th>Status</th><th>Catatan / alasan</th><th></th></tr></thead><tbody>${filtered.map(l=>`<tr><td><span class="primary">${esc(l.number)}</span><span class="secondary">${esc(l.type)}</span></td><td><span class="primary">${esc(l.citizen)}</span><span class="secondary">${esc(l.nik)}</span></td><td>${esc(l.date)}<span class="secondary">Diperbarui ${esc(l.updated)}</span></td><td>${statusBadge(l.status)}</td><td><div class="reason">${icon('info','sm')}<span>${esc(l.reason)}</span></div></td><td><div class="table-actions"><button class="icon-btn" data-action="view-letter" data-id="${l.id}">${icon('eye','sm')}</button>${l.status==='Disetujui'?`<button class="icon-btn" data-action="print-letter" data-id="${l.id}">${icon('printer','sm')}</button>`:''}</div></td></tr>`).join('')}</tbody></table><div class="pagination"><span>Menampilkan ${filtered.length} surat</span><div class="page-buttons"><button class="page-btn">‹</button><button class="page-btn active">1</button><button class="page-btn">2</button><button class="page-btn">›</button></div></div></div>`;
}
function statusMini(label,count,color){ return `<div class="status-mini"><i class="status-dot ${color}"></i><div><strong>${count}</strong><span>${label}</span></div></div>`; }

function renderTemplates() {
  return `${pageHeader('Template Surat','Edit format sekali, simpan, lalu gunakan kembali untuk setiap pengajuan.',`<button class="btn btn-outline" data-action="template-guide">${icon('info','sm')} Panduan variabel</button>`)}
    <div class="small-note mb-14">${icon('info','sm')} Gunakan variabel seperti <b>{{nama_warga}}</b>, <b>{{nik}}</b>, dan <b>{{keperluan}}</b>. Data akan terisi otomatis saat surat dibuat.</div>
    <div class="template-grid">${LETTER_TYPES.map(t=>`<article class="template-card color-${t.color}"><div class="template-preview"><div class="paper-mini"><i class="paper-logo"></i><i class="paper-line dark"></i><i class="paper-line short"></i><br><i class="paper-line"></i><i class="paper-line"></i><i class="paper-line"></i><i class="paper-line short"></i></div></div><div class="template-info"><span class="badge approved">Aktif</span><h3>${t.name}</h3><p>Format baku ${t.name.toLowerCase()} Desa Bontoloe untuk pengajuan ke kecamatan.</p><div class="template-footer"><span class="edited">Diedit ${esc(state.templates[t.name]?.edited||'-')}</span><button class="btn btn-sm btn-outline" data-action="edit-template" data-type="${t.name}">${icon('edit','sm')} Edit template</button></div></div></article>`).join('')}</div>`;
}

function renderHistory() {
  const items = state.role==='desa'?state.letters:state.incoming;
  const filtered=items.filter(l=>['Disetujui','Ditolak'].includes(l.status));
  return `${pageHeader('Riwayat Persuratan',`Arsip keputusan surat yang telah selesai diproses ${state.role==='desa'?'untuk Desa Bontoloe':'oleh Kecamatan Takalar'}.`,`<button class="btn btn-outline" data-action="export">${icon('download','sm')} Ekspor riwayat</button>`)}
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search','sm')}</span><input placeholder="Cari riwayat surat..."></div><select class="toolbar-select"><option>Semua status</option><option>Disetujui</option><option>Ditolak</option></select>${state.role==='camat'?`<select class="toolbar-select"><option>Semua desa</option>${state.villages.map(v=>`<option>${v.name}</option>`).join('')}</select>`:''}<select class="toolbar-select"><option>Agustus 2026</option><option>Juli 2026</option></select><div class="toolbar-spacer"></div></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>Tanggal keputusan</th><th>Nomor / jenis</th>${state.role==='camat'?'<th>Asal desa</th>':'<th>Nama warga</th>'}<th>Status akhir</th><th>Alasan / catatan keputusan</th><th></th></tr></thead><tbody>${filtered.map(l=>`<tr><td>${esc(l.updated)}</td><td><span class="primary">${esc(l.number)}</span><span class="secondary">${esc(l.type)}</span></td><td><span class="primary">${esc(state.role==='camat'?l.village:l.citizen)}</span><span class="secondary">${esc(l.nik)}</span></td><td>${statusBadge(l.status)}</td><td><div class="reason">${icon('info','sm')}<span>${esc(l.reason)}</span></div></td><td><div class="table-actions"><button class="icon-btn" data-action="${state.role==='camat'?'review-letter':'view-letter'}" data-id="${l.id}">${icon('eye','sm')}</button><button class="icon-btn" data-action="print-letter" data-id="${l.id}">${icon('download','sm')}</button></div></td></tr>`).join('')}</tbody></table><div class="pagination"><span>${filtered.length} riwayat keputusan</span><div class="page-buttons"><button class="page-btn active">1</button></div></div></div>`;
}

function renderCamatDashboard() {
  const counts=countStatuses(state.incoming); const totalResidents=state.villages.reduce((a,v)=>a+v.residents,0);
  return `${pageHeader('Selamat datang di Portal Kecamatan','Pantau layanan desa dan selesaikan peninjauan surat hari ini.',`<button class="btn btn-primary" data-page="incoming">${icon('mail','sm')} Tinjau surat masuk</button>`)}
    <section class="welcome-banner"><div class="welcome-copy"><span class="mini">Pusat kendali kecamatan</span><h2>Ada ${counts.Terkirim} surat baru menunggu tinjauan.</h2><p>Periksa kelengkapan berkas dari desa dan berikan keputusan beserta alasan agar layanan warga tetap transparan.</p><button class="btn" data-page="incoming">Buka antrean surat ${icon('chevron-right','sm')}</button></div><div class="banner-art"><img src="assets/images/banner-camat.svg" alt="Ilustrasi kantor kecamatan"></div></section>
    <div class="stats-grid">${statCard('village','Desa terpantau',state.villages.length,'Semua aktif')}${statCard('users','Warga terdata',totalResidents.toLocaleString('id-ID'),'+3.8%','blue')}${statCard('mail','Surat masuk bulan ini','156','+14%','orange')}${statCard('check','Tingkat persetujuan','92%','+2.4%','purple')}</div>
    <div class="dashboard-grid"><div>
      <section class="panel mb-14"><div class="panel-head"><div><h3>Surat perlu ditinjau</h3><p>Urut berdasarkan waktu pengiriman terbaru</p></div><button class="see-all" data-page="incoming">Lihat semua ${icon('chevron-right','sm')}</button></div>${recentTable(state.incoming.filter(x=>['Terkirim','Diterima'].includes(x.status)).slice(0,5),true)}</section>
      <section class="panel"><div class="panel-head"><div><h3>Pantauan desa</h3><p>Ringkasan penduduk dan surat masuk</p></div><button class="see-all" data-page="villages">Semua desa ${icon('chevron-right','sm')}</button></div><div class="panel-body"><div class="quick-actions">${state.villages.slice(0,3).map(v=>`<button class="quick-action" data-action="view-village" data-village="${v.name}"><span class="village-avatar">${icon('village','sm')}${v.incoming?`<i class="incoming-count">${v.incoming}</i>`:''}</span><span><strong>${v.name.replace('Desa ','')}</strong><span>${v.residents.toLocaleString('id-ID')} warga · ${v.incoming} masuk</span></span></button>`).join('')}</div></div></section>
    </div><div>
      <section class="panel mb-14"><div class="panel-head"><div><h3>Status surat</h3><p>Distribusi bulan ini</p></div><span class="badge approved">Real-time</span></div><div class="panel-body"><div class="status-list">${statusProgress('Disetujui',counts.Disetujui,62,'')}${statusProgress('Diterima',counts.Diterima,35,'blue')}${statusProgress('Terkirim',counts.Terkirim,45,'orange')}${statusProgress('Ditolak',counts.Ditolak,15,'red')}</div></div></section>
      <section class="panel"><div class="panel-head"><div><h3>Aktivitas petugas</h3><p>Pembaruan keputusan hari ini</p></div></div><div class="panel-body activity-list">${activity('check','Surat disetujui','Penetapan kader dari Desa Boddia.','28 menit lalu')}${activity('mail','Berkas diterima','Undangan dari Desa Aeng Towa.','1 jam lalu')}${activity('x','Surat dikembalikan','Edaran Desa Popo perlu diperbaiki.','2 jam lalu')}</div></section>
    </div></div>`;
}

function renderIncoming() {
  const counts=countStatuses(state.incoming);
  const filtered=state.letterFilter==='Semua'?state.incoming:state.incoming.filter(l=>l.status===state.letterFilter);
  return `${pageHeader('Surat Masuk','Tinjau usulan desa, putuskan status, dan berikan alasan yang jelas.',`<button class="btn btn-outline" data-action="refresh">${icon('refresh','sm')} Sinkronkan</button>`)}
    <div class="status-summary">${statusMini('Baru terkirim',counts.Terkirim,'blue')}${statusMini('Sedang ditinjau',counts.Diterima,'orange')}${statusMini('Disetujui',counts.Disetujui,'')}${statusMini('Ditolak',counts.Ditolak,'red')}</div>
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search','sm')}</span><input placeholder="Cari nomor, warga, atau desa..."></div><select class="toolbar-select" id="incoming-filter"><option ${state.letterFilter==='Semua'?'selected':''}>Semua</option>${['Terkirim','Diterima','Disetujui','Ditolak'].map(s=>`<option ${state.letterFilter===s?'selected':''}>${s}</option>`).join('')}</select><select class="toolbar-select"><option>Semua desa</option>${state.villages.map(v=>`<option>${v.name}</option>`).join('')}</select><div class="toolbar-spacer"></div><button class="btn btn-sm btn-outline">${icon('filter','sm')} Filter lanjutan</button></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>Nomor / jenis</th><th>Asal desa</th><th>Nama warga</th><th>Dikirim</th><th>Status</th><th>Catatan terakhir</th><th></th></tr></thead><tbody>${filtered.map(l=>`<tr><td><span class="primary">${esc(l.number)}</span><span class="secondary">${esc(l.type)}</span></td><td><span class="primary">${esc(l.village)}</span></td><td><span class="primary">${esc(l.citizen)}</span><span class="secondary">${esc(l.nik)}</span></td><td>${esc(l.date)}</td><td>${statusBadge(l.status)}</td><td><div class="reason"><span>${esc(l.reason)}</span></div></td><td><button class="btn btn-sm ${['Terkirim','Diterima'].includes(l.status)?'btn-secondary':'btn-outline'}" data-action="review-letter" data-id="${l.id}">${icon('eye','sm')} Tinjau</button></td></tr>`).join('')}</tbody></table><div class="pagination"><span>Menampilkan ${filtered.length} dari ${state.incoming.length} surat</span><div class="page-buttons"><button class="page-btn">‹</button><button class="page-btn active">1</button><button class="page-btn">2</button><button class="page-btn">›</button></div></div></div>`;
}

function renderVillages() {
  return `${pageHeader('Daftar Desa','Pantau aktivitas, jumlah penduduk, dan surat masuk dari setiap desa.',`<button class="btn btn-primary" data-action="add-account">${icon('user-plus','sm')} Tambah akun desa</button>`)}
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search','sm')}</span><input id="village-search" placeholder="Cari nama desa..."></div><select class="toolbar-select"><option>Semua kecamatan</option><option>Galesong</option><option>Galesong Selatan</option><option>Galesong Utara</option></select><div class="toolbar-spacer"></div><span class="small-note">${icon('users','sm')} ${state.villages.reduce((a,v)=>a+v.residents,0).toLocaleString('id-ID')} warga terpantau</span></div>
    <div class="village-grid" id="village-grid">${state.villages.map((v,i)=>`<article class="village-card" data-village-name="${v.name.toLowerCase()}"><div class="village-head"><span class="village-avatar color-${LETTER_TYPES[i%7].color}">${icon('village','lg')}${v.incoming?`<i class="incoming-count">${v.incoming}</i>`:''}</span><div><h3>${esc(v.name)}</h3><p>${esc(v.district)}</p></div><button class="icon-btn" style="margin-left:auto" data-action="view-village" data-village="${v.name}">${icon('more','sm')}</button></div><div class="village-stats"><div class="village-stat"><strong>${v.residents.toLocaleString('id-ID')}</strong><span>Warga terdata</span></div><div class="village-stat"><strong>${v.incoming}</strong><span>Surat masuk</span></div></div><div class="village-foot"><span class="online">Aktif</span><span>${esc(v.active)}</span><button class="see-all" data-action="view-village" data-village="${v.name}">Pantau ${icon('chevron-right','sm')}</button></div></article>`).join('')}</div>`;
}

function renderAccounts() {
  return `${pageHeader('Akun Desa','Buat dan kelola akses desa ke sistem persuratan kecamatan.',`<button class="btn btn-primary" data-action="add-account">${icon('user-plus','sm')} Tambah akun desa</button>`)}
    <div class="small-note mb-14">${icon('shield','sm')} Hanya akun kecamatan yang dapat membuat akun desa. Setiap desa memiliki username unik dan dapat mengganti sandi setelah login pertama.</div>
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search','sm')}</span><input placeholder="Cari akun atau desa..."></div><select class="toolbar-select"><option>Semua status</option><option>Aktif</option><option>Nonaktif</option></select><div class="toolbar-spacer"></div><button class="btn btn-sm btn-outline" data-action="export">${icon('download','sm')} Ekspor akun</button></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>Desa</th><th>Admin desa</th><th>Username</th><th>Kontak</th><th>Dibuat</th><th>Status</th><th></th></tr></thead><tbody>${state.accounts.map((a,i)=>`<tr><td><div class="table-user"><span class="village-avatar" style="width:32px;height:32px;border-radius:9px">${icon('village','sm')}</span><span><span class="primary">${esc(a.name)}</span><span class="secondary">${esc(a.district)}</span></span></div></td><td>${esc(a.admin)}</td><td><span class="primary">${esc(a.user)}</span><span class="secondary">Sandi terenkripsi</span></td><td>${esc(a.phone)}</td><td>${esc(a.created)}</td><td><span class="badge approved">${esc(a.status)}</span></td><td><div class="table-actions"><button class="icon-btn" data-action="copy-account" data-index="${i}" title="Salin kredensial">${icon('copy','sm')}</button><button class="icon-btn" data-action="edit-account" data-index="${i}">${icon('edit','sm')}</button><button class="icon-btn">${icon('more','sm')}</button></div></td></tr>`).join('')}</tbody></table><div class="pagination"><span>${state.accounts.length} akun desa aktif</span><div class="page-buttons"><button class="page-btn active">1</button></div></div></div>`;
}

function openModal(inner, size='') { $('#modal-root').innerHTML=`<div class="modal-backdrop" data-action="backdrop"><section class="modal ${size}">${inner}</section></div>`; }
function closeModal(){ $('#modal-root').innerHTML=''; }
function modalHead(title, subtitle, ic='file'){ return `<div class="modal-head"><span class="modal-title-icon">${icon(ic)}</span><div><h2>${title}</h2><p>${subtitle}</p></div><button class="icon-btn" data-action="close-modal">${icon('x','sm')}</button></div>`; }

function openNewLetter(type='') {
  const selected=type || LETTER_TYPES[0].name;
  openModal(`<form id="new-letter-form">${modalHead('Buat usulan surat','Isi data, pratinjau, lalu kirim ke kecamatan.','mail')}<div class="modal-body"><div class="form-grid">
    <div class="field span-2"><label class="form-label">Jenis surat</label><select name="type" required>${LETTER_TYPES.map(t=>`<option ${t.name===selected?'selected':''}>${t.name}</option>`).join('')}</select></div>
    <div class="field span-2"><label class="form-label">Warga pemohon</label><select name="resident" required><option value="">Pilih warga berdasarkan nama / NIK</option>${state.residents.map(r=>`<option value="${r.nik}">${esc(r.name)} — ${esc(r.nik)}</option>`).join('')}</select><span class="helper">Data identitas akan terisi otomatis dari data warga.</span></div>
    <div class="field"><label class="form-label">Nomor surat</label><input name="number" value="140/${String(state.letters.length+32).padStart(3,'0')}/DB/VIII/2026" required></div>
    <div class="field"><label class="form-label">Tanggal surat</label><input name="date" type="date" value="2026-08-13" required></div>
    <div class="field span-2"><label class="form-label">Ditujukan kepada</label><input name="destination" value="Camat Galesong, Kabupaten Takalar" required></div>
    <div class="field span-2"><label class="form-label">Keperluan / perihal</label><textarea name="purpose" placeholder="Jelaskan keperluan pengajuan surat..." required></textarea></div>
    <div class="field span-2"><label class="form-label">Catatan tambahan <span class="muted">(opsional)</span></label><textarea name="note" placeholder="Catatan untuk petugas kecamatan" style="min-height:65px"></textarea></div>
    <div class="small-note span-2">${icon('info','sm')} Surat akan dibuat menggunakan template aktif dan langsung dikirim ke antrean Kecamatan Takalar.</div>
  </div></div><div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Batal</button><button type="button" class="btn btn-secondary" data-action="preview-new-letter">${icon('eye','sm')} Pratinjau</button><button type="submit" class="btn btn-primary">${icon('send','sm')} Simpan & kirim</button></div></form>`,'modal-lg');
}

function openAddResident(existing=null) {
  openModal(`<form id="resident-form">${modalHead(existing?'Edit data warga':'Tambah data warga',existing?'Perbarui informasi penduduk.':'Input data penduduk Desa Bontoloe.','user-plus')}<div class="modal-body"><div class="form-grid">
    <div class="field"><label class="form-label">NIK</label><input name="nik" maxlength="16" value="${esc(existing?.nik||'')}" placeholder="16 digit NIK" ${existing?'readonly':''} required></div>
    <div class="field"><label class="form-label">Nama lengkap</label><input name="name" value="${esc(existing?.name||'')}" placeholder="Sesuai KTP" required></div>
    <div class="field"><label class="form-label">Jenis kelamin</label><select name="gender"><option ${existing?.gender==='Laki-laki'?'selected':''}>Laki-laki</option><option ${existing?.gender==='Perempuan'?'selected':''}>Perempuan</option></select></div>
    <div class="field"><label class="form-label">Tempat, tanggal lahir</label><input name="birth" value="${esc(existing?.birth||'')}" placeholder="Takalar, 13 Agustus 1990" required></div>
    <div class="field span-2"><label class="form-label">Alamat lengkap</label><textarea name="address" style="min-height:70px" placeholder="Dusun, RT/RW..." required>${esc(existing?.address||'')}</textarea></div>
    <div class="field"><label class="form-label">Status dalam keluarga</label><select name="family"><option ${existing?.status==='Kepala Keluarga'?'selected':''}>Kepala Keluarga</option><option ${existing?.status==='Istri'?'selected':''}>Istri</option><option ${existing?.status==='Anak'?'selected':''}>Anak</option><option>Lainnya</option></select></div>
    <div class="field"><label class="form-label">Nomor KK</label><input name="kk" maxlength="16" placeholder="16 digit nomor KK"></div>
  </div></div><div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Batal</button><button type="submit" class="btn btn-primary">${icon('check','sm')} ${existing?'Simpan perubahan':'Simpan data warga'}</button></div></form>`);
}

function openResidentDetail(resident) {
  openModal(`${modalHead('Detail warga','Data penduduk Desa Bontoloe.','user')}<div class="modal-body"><div class="detail-list"><div class="detail-row"><span>NIK</span><strong>${esc(resident.nik)}</strong></div><div class="detail-row"><span>Nama lengkap</span><strong>${esc(resident.name)}</strong></div><div class="detail-row"><span>Jenis kelamin</span><strong>${esc(resident.gender)}</strong></div><div class="detail-row"><span>Tempat/Tgl lahir</span><strong>${esc(resident.birth)}</strong></div><div class="detail-row"><span>Alamat</span><strong>${esc(resident.address)}</strong></div><div class="detail-row"><span>Status keluarga</span><strong>${esc(resident.status)}</strong></div></div></div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button><button class="btn btn-primary" data-action="new-letter">${icon('mail','sm')} Buat surat</button></div>`);
}

function documentPaper(letter) {
  return `<div class="document-paper"><div class="doc-header"><span class="doc-seal">T</span><strong>PEMERINTAH KABUPATEN TAKALAR</strong><b>KECAMATAN GALESONG · DESA BONTOLOE</b><span>Jl. Poros Galesong, Kabupaten Takalar, Sulawesi Selatan</span></div><div class="doc-title">${esc(letter.type.toUpperCase())}</div><div class="doc-number">Nomor: ${esc(letter.number)}</div><p>Yang bertanda tangan di bawah ini, Pemerintah Desa Bontoloe, menerangkan bahwa:</p><table class="doc-table"><tr><td>Nama</td><td>: <b>${esc(letter.citizen)}</b></td></tr><tr><td>NIK</td><td>: ${esc(letter.nik)}</td></tr><tr><td>Alamat</td><td>: Desa Bontoloe, Kecamatan Galesong</td></tr></table><p>Dengan ini mengajukan surat untuk keperluan <b>${esc(letter.purpose)}</b>. Surat ini ditujukan kepada Pemerintah Kecamatan Galesong Kabupaten Takalar.</p><p>Demikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p><div class="doc-sign"><span>Bontoloe, ${esc(letter.date)}</span><br><b>Kepala Desa Bontoloe</b><div class="doc-sign-space"></div><b>(________________)</b></div></div>`;
}

function openLetterView(letter) {
  openModal(`${modalHead('Detail surat',`${letter.number} · ${letter.type}`,'file')}<div class="modal-body"><div class="review-grid"><div class="document-preview">${documentPaper(letter)}</div><div class="review-info"><h3>Informasi pengajuan</h3><div class="detail-list"><div class="detail-row"><span>ID surat</span><strong>${esc(letter.id)}</strong></div><div class="detail-row"><span>Nama warga</span><strong>${esc(letter.citizen)}</strong></div><div class="detail-row"><span>NIK</span><strong>${esc(letter.nik)}</strong></div><div class="detail-row"><span>Dikirim</span><strong>${esc(letter.updated)}</strong></div><div class="detail-row"><span>Status</span><strong>${statusBadge(letter.status)}</strong></div><div class="detail-row"><span>Catatan/alasan</span><strong>${esc(letter.reason)}</strong></div></div><div class="decision-box"><h4>Alur berikutnya</h4><p>${letter.status==='Disetujui'?'Surat sudah dicetak di kecamatan. Warga dapat mengambil dan menandatangani dokumen di loket.':letter.status==='Ditolak'?'Perbaiki kekurangan sesuai alasan penolakan, lalu ajukan kembali.':'Surat sedang dalam alur pemeriksaan Kecamatan Takalar.'}</p></div></div></div></div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button><button class="btn btn-secondary" data-action="print-letter" data-id="${letter.id}">${icon('printer','sm')} Cetak pratinjau</button></div>`,'modal-xl');
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
    <div class="field"><label class="form-label">Kecamatan</label><select name="district"><option>Kec. Galesong</option><option>Kec. Galesong Selatan</option><option>Kec. Galesong Utara</option><option>Kec. Polongbangkeng Utara</option></select></div>
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
  openModal(`${modalHead(village.name,`${village.district} · Pantauan akun desa`,'village')}<div class="modal-body"><div class="stats-grid" style="grid-template-columns:1fr 1fr"><div class="stat-card"><div class="stat-top"><span class="stat-icon">${icon('users')}</span></div><div class="value">${village.residents.toLocaleString('id-ID')}</div><div class="label">Warga terdata</div></div><div class="stat-card"><div class="stat-top"><span class="stat-icon orange">${icon('mail')}</span></div><div class="value">${village.incoming}</div><div class="label">Surat masuk bulan ini</div></div></div><div class="detail-list mb-14"><div class="detail-row"><span>Admin desa</span><strong>${esc(village.admin)}</strong></div><div class="detail-row"><span>Username</span><strong>${esc(village.user)}</strong></div><div class="detail-row"><span>Kontak</span><strong>${esc(village.phone)}</strong></div><div class="detail-row"><span>Aktivitas</span><strong class="text-brand">Aktif ${esc(village.active)}</strong></div></div><h3 class="section-title">Surat terbaru dari desa</h3>${letters.length?recentTable(letters.slice(0,4),true):`<div class="small-note">Belum ada surat pada data demo.</div>`}</div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button><button class="btn btn-primary" data-action="go-village-incoming" data-village="${village.name}">${icon('mail','sm')} Lihat surat masuk</button></div>`,'modal-lg');
}

function findLetter(id) { return [...state.incoming,...state.letters].find(l=>l.id===id); }

// Global interactions
document.addEventListener('click', e => {
  const el=e.target.closest('[data-action],[data-page]'); if(!el) return;
  if(el.dataset.page){ state.page=el.dataset.page; state.mobileOpen=false; renderApp(); return; }
  const action=el.dataset.action;
  if(action==='pick-role'){ state.loginRole=el.dataset.role; renderLogin(); }
  else if(action==='toggle-password'){ const p=$('#login-password'); p.type=p.type==='password'?'text':'password'; }
  else if(action==='forgot') toast('Hubungi administrator','Kecamatan dapat mereset kata sandi akun desa.');
  else if(action==='logout'){ state.role=null; state.page='dashboard'; renderLogin(); toast('Anda telah keluar','Sesi berakhir dengan aman.'); }
  else if(action==='open-mobile'){ state.mobileOpen=true; renderApp(); }
  else if(action==='close-mobile'){ state.mobileOpen=false; renderApp(); }
  else if(action==='close-modal'){ closeModal(); }
  else if(action==='backdrop' && e.target===el){ closeModal(); }
  else if(action==='new-letter'){ closeModal(); openNewLetter(el.dataset.type||''); }
  else if(action==='add-resident'){ openAddResident(); }
  else if(action==='edit-resident'){ openAddResident(state.residents.find(r=>r.nik===el.dataset.nik)); }
  else if(action==='view-resident'){ openResidentDetail(state.residents.find(r=>r.nik===el.dataset.nik)); }
  else if(action==='view-letter'){ openLetterView(findLetter(el.dataset.id)); }
  else if(action==='review-letter'){ openReview(findLetter(el.dataset.id)); }
  else if(action==='edit-template'){ openTemplateEditor(el.dataset.type); }
  else if(action==='add-account'){ openAddAccount(); }
  else if(action==='edit-account'){ openAddAccount(state.accounts[+el.dataset.index],el.dataset.index); }
  else if(action==='view-village'){ openVillageDetail(state.villages.find(v=>v.name===el.dataset.village)); }
  else if(action==='go-village-incoming'){ closeModal(); state.page='incoming'; renderApp(); }
  else if(action==='copy-account'){ const a=state.accounts[+el.dataset.index]; if(navigator.clipboard) navigator.clipboard.writeText(`Username: ${a.user}\nPassword: ${a.password}`); toast('Kredensial disalin',`Akun ${a.name} siap dibagikan secara aman.`); }
  else if(action==='notifications') toast('3 notifikasi baru','Ada surat masuk dan pembaruan status hari ini.');
  else if(action==='help') toast('Pusat bantuan','Hubungi Diskominfo Takalar di (0418) 21001.');
  else if(action==='profile-menu') toast('Profil pengguna','Pengaturan profil tersedia pada versi berikutnya.');
  else if(action==='refresh') { toast('Data tersinkron','Daftar surat sudah menggunakan data terbaru.'); }
  else if(action==='export') toast('Ekspor disiapkan','File laporan demo berhasil disiapkan untuk diunduh.');
  else if(action==='print-letter') { window.print(); toast('Pratinjau cetak dibuka','Gunakan dialog browser untuk menyimpan sebagai PDF.'); }
  else if(action==='template-guide') toast('Panduan variabel','Variabel {{nama_warga}}, {{nik}}, {{alamat}}, {{tanggal}}, dan {{keperluan}} akan diisi otomatis.');
  else if(action==='preview-new-letter') toast('Pratinjau siap','Lengkapi warga dan keperluan agar pratinjau surat terisi sempurna.');
  else if(action==='preview-template') toast('Template valid','Struktur template siap digunakan untuk membuat surat.');
  else if(action==='insert-variable' || el.dataset.insert){
    const area=$('#template-editor'); const text=el.dataset.insert; if(area){ const start=area.selectionStart; area.value=area.value.slice(0,start)+text+area.value.slice(area.selectionEnd); area.focus(); area.selectionStart=area.selectionEnd=start+text.length; }
  }
});

document.addEventListener('submit', e => {
  e.preventDefault(); const form=e.target; const fd=new FormData(form);
  if(form.id==='login-form'){
    const username=fd.get('username').trim(), password=fd.get('password');
    if(state.loginRole==='camat'){
      if(username==='takalar' && password==='takalarcepat'){ state.role='camat'; state.page='dashboard'; renderApp(); toast('Selamat datang','Login Kecamatan Takalar berhasil.'); }
      else toast('Login gagal','Username atau kata sandi camat tidak sesuai.','error');
    } else {
      const account=state.accounts.find(a=>a.user===username && a.password===password);
      if(account){ state.role='desa'; state.currentVillage=account.name; state.page='dashboard'; renderApp(); toast('Selamat datang',`Login ${account.name} berhasil.`); }
      else toast('Login gagal','Gunakan akun demo bontoloe / desa123.','error');
    }
  }
  if(form.id==='new-letter-form'){
    const resident=state.residents.find(r=>r.nik===fd.get('resident'));
    if(!resident){ toast('Data belum lengkap','Silakan pilih warga pemohon.','error'); return; }
    const l={ id:`SRT-0826-${uid().slice(0,3)}`, number:fd.get('number'), type:fd.get('type'), citizen:resident.name, nik:resident.nik, village:'Desa Bontoloe', purpose:fd.get('purpose'), date:'13 Agu 2026', status:'Terkirim', reason:'Menunggu pemeriksaan kelengkapan oleh petugas kecamatan.', updated:'13 Agu 2026, 09:48' };
    state.letters.unshift(l); state.incoming.unshift({...l}); const v=state.villages.find(v=>v.name==='Desa Bontoloe'); if(v) v.incoming++; persist(); closeModal(); state.page='status'; renderApp(); toast('Surat berhasil dikirim',`${l.type} untuk ${l.citizen} masuk antrean kecamatan.`);
  }
  if(form.id==='resident-form'){
    const nik=fd.get('nik').trim(); let r=state.residents.find(r=>r.nik===nik);
    const data={nik,name:fd.get('name'),gender:fd.get('gender'),birth:fd.get('birth'),address:fd.get('address'),status:fd.get('family')};
    if(r) Object.assign(r,data); else { state.residents.unshift(data); state.residentTotal++; }
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
    const idx=form.dataset.index; const data={name:fd.get('name'),district:fd.get('district'),admin:fd.get('admin'),user:fd.get('username'),password:fd.get('password'),phone:fd.get('phone'),residents:+fd.get('residents')||0,incoming:0,active:'Baru dibuat',status:'Aktif',created:'13 Agu 2026'};
    if(idx!==''){ Object.assign(state.accounts[+idx],data); const v=state.villages.find(v=>v.user===state.accounts[+idx].user); if(v) Object.assign(v,data); }
    else { state.accounts.push(data); state.villages.push({...data}); }
    persist(); closeModal(); if(state.page==='accounts'||state.page==='villages') renderApp(); toast(idx!==''?'Akun diperbarui':'Akun desa berhasil dibuat',`${data.name} dapat login dengan username ${data.user}.`);
  }
});

document.addEventListener('change', e => {
  if(e.target.id==='status-filter'){ state.statusFilter=e.target.value; renderApp(); }
  if(e.target.id==='incoming-filter'){ state.letterFilter=e.target.value; renderApp(); }
});

document.addEventListener('input', e => {
  if(e.target.id==='inventory-search') { const q=e.target.value.toLowerCase(); $$('.letter-card[data-letter-name]').forEach(c=>c.style.display=c.dataset.letterName.includes(q)?'':'none'); }
  if(e.target.id==='village-search') { const q=e.target.value.toLowerCase(); $$('.village-card[data-village-name]').forEach(c=>c.style.display=c.dataset.villageName.includes(q)?'':'none'); }
  if(e.target.id==='resident-search') { state.residentSearch=e.target.value; clearTimeout(window._residentTimer); window._residentTimer=setTimeout(()=>renderApp(),300); }
});

renderLogin();
