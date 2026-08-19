const PORTAL = document.body.dataset.portal || 'desa';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="assets/images/icons.svg#i-${name}"></use></svg>`;
const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();

// Menampilkan status loading pada tombol (spinner + kunci klik) selama proses
// ke Supabase berjalan, lalu mengembalikan tampilan semula lewat clearBtnLoading.
function setBtnLoading(btn, label = 'Memproses...') {
  if (!btn || btn.classList.contains('is-loading')) return;
  btn.dataset.originalHtml = btn.innerHTML;
  btn.classList.add('is-loading');
  btn.disabled = true;
  btn.innerHTML = `<span class="btn-spinner"></span><span>${esc(label)}</span>`;
}
function clearBtnLoading(btn) {
  if (!btn || !btn.classList.contains('is-loading')) return;
  btn.classList.remove('is-loading');
  btn.disabled = false;
  if (btn.dataset.originalHtml !== undefined) { btn.innerHTML = btn.dataset.originalHtml; delete btn.dataset.originalHtml; }
}

// ===== Template Word (.docx) =====
// Sebelumnya template surat cuma teks polos di textarea — sekarang staf desa
// (termasuk yang kurang familiar dengan UI web) bisa unduh file Word, edit
// bebas di Microsoft Word/WPS pakai variabel {{...}}, lalu unggah balik.
// Saat surat dibuat, docxtemplater otomatis isi variabel ke file Word itu.
const TEMPLATE_BUCKET = 'letter-templates';
const LETTER_BUCKET = 'generated-letters';
const DEFAULT_TEMPLATE_URL = 'assets/templates/default-template.docx';
const slugType = (t = '') => t.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// Ambil isi .docx yang akan dipakai untuk sebuah jenis surat: template hasil
// unggahan desa kalau ada, kalau belum pernah unggah pakai template dasar bawaan.
async function getTemplateDocxBuffer(type, villageId) {
  let path = null;
  if (villageId && villageId === state.currentVillageId) {
    path = state.templates[type]?.docxPath || null;
  } else if (villageId) {
    // Dipakai kecamatan (belum punya state.templates desa lain): tanya langsung ke tabel.
    const { data } = await sb.from('letter_templates').select('docx_path').eq('village_id', villageId).eq('letter_type', type).maybeSingle();
    path = data?.docx_path || null;
  }
  if (path) {
    const { data, error } = await sb.storage.from(TEMPLATE_BUCKET).download(path);
    if (error) throw new Error('Gagal mengambil template Word dari server.');
    return await data.arrayBuffer();
  }
  const res = await fetch(DEFAULT_TEMPLATE_URL);
  if (!res.ok) throw new Error('Gagal memuat template Word dasar.');
  return await res.arrayBuffer();
}

function newDocxtemplater(arrayBuffer) {
  const zip = new PizZip(arrayBuffer);
  return new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true, delimiters: { start: '{{', end: '}}' } });
}

function explainDocxError(err) {
  const list = err?.properties?.errors;
  if (Array.isArray(list) && list.length) return list.map(e => e.properties?.explanation || e.message).join('; ');
  return err?.message || 'Terjadi kesalahan saat memproses dokumen Word.';
}

// Tombol "Unduh Word" di halaman Template Surat: kasih file .docx siap edit.
async function downloadTemplateForEditing(type) {
  try {
    const buf = await getTemplateDocxBuffer(type, state.currentVillageId);
    downloadBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
      `Template ${type} - ${state.currentVillage || 'Desa'}.docx`);
  } catch (err) { toast('Gagal mengunduh template', err.message, 'error'); }
}

// Tombol "Unggah dari Word": validasi file lalu simpan ke Supabase Storage
// dan catat path-nya di tabel letter_templates.
//
// PENTING: tiap upload pakai NAMA FILE BARU (bukan menimpa path yang sama).
// Kalau path sama ditimpa terus (upsert), Supabase Storage CDN kadang masih
// menyajikan versi cache lama ke download() berikutnya — makanya sebelumnya
// hasil generate surat "masih pakai template lama" walau sudah upload baru.
// Dengan path unik per upload, masalah cache basi ini hilang total.
async function uploadTemplateDocx(type, file) {
  if (!file.name.toLowerCase().endsWith('.docx')) { toast('Format tidak didukung', 'Unggah file .docx hasil simpan dari Microsoft Word (bukan .doc atau .pdf).', 'error'); return; }
  try { new PizZip(await file.arrayBuffer()); } catch { toast('File tidak valid', 'File ini bukan dokumen Word yang bisa dibaca, atau rusak.', 'error'); return; }
  const oldPath = state.templates[type]?.docxPath || null;
  const path = `${state.currentVillageId}/${slugType(type)}-${Date.now()}.docx`;
  const { error: upErr } = await sb.storage.from(TEMPLATE_BUCKET).upload(path, file, { cacheControl: '0', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  if (upErr) { toast('Gagal mengunggah template', upErr.message, 'error'); return; }
  const { error: dbErr } = await sb.from('letter_templates').upsert(
    { village_id: state.currentVillageId, letter_type: type, docx_path: path, content: state.templates[type]?.content || defaultTemplate(type, state.currentVillage) },
    { onConflict: 'village_id,letter_type' }
  );
  if (dbErr) { toast('Gagal menyimpan data template', dbErr.message, 'error'); return; }
  if (oldPath && oldPath !== path) sb.storage.from(TEMPLATE_BUCKET).remove([oldPath]).catch(() => {}); // beres-beres, boleh gagal diam-diam
  await loadTemplates(); renderApp();
  toast('Template Word tersimpan', `${type} sekarang memakai format Word yang kamu unggah.`);
}

// Isi otomatis file Word (template aktif) dengan data surat, lalu simpan
// hasilnya ke Storage dan kembalikan blob-nya untuk diunduh/dicetak.
async function generateLetterDocx(letterId, letterData) {
  const villageId = letterData.villageId || state.currentVillageId;
  const buf = await getTemplateDocxBuffer(letterData.type, villageId);
  let docTemplater;
  try {
    docTemplater = newDocxtemplater(buf);
    docTemplater.render({ ...fillTemplateVars(letterData), jenis_surat: letterData.type, nama_desa: letterData.village || state.currentVillage });
  } catch (err) { throw new Error(`Template Word "${letterData.type}" bermasalah: ${explainDocxError(err)}`); }
  const outBlob = docTemplater.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const path = `${villageId}/${letterId}.docx`;
  const { error: upErr } = await sb.storage.from(LETTER_BUCKET).upload(path, outBlob, { upsert: true, cacheControl: '0', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  if (!upErr) await sb.from('letters').update({ docx_path: path }).eq('id', letterId);
  return outBlob;
}

// Tombol "Unduh dokumen Word" di Status Surat / Surat Masuk: pakai file yang
// sudah pernah dibuat kalau ada, kalau belum ada buat ulang dari template aktif.
async function downloadLetterDocx(letter) {
  try {
    if (letter.docxPath) {
      const { data, error } = await sb.storage.from(LETTER_BUCKET).download(letter.docxPath);
      if (error) throw error;
      downloadBlob(data, `${letter.number} - ${letter.citizen}.docx`);
      return;
    }
    const blob = await generateLetterDocx(letter.id, letter);
    downloadBlob(blob, `${letter.number} - ${letter.citizen}.docx`);
  } catch (err) { toast('Gagal menyiapkan dokumen Word', err.message, 'error'); }
}

const LETTER_TYPES = [
  { name: 'Surat Permohonan', icon: 'mail', color: 'green', desc: 'Pengajuan permohonan resmi warga kepada pihak kecamatan.' },
  { name: 'Surat Keputusan', icon: 'shield', color: 'blue', desc: 'Naskah keputusan resmi yang diterbitkan pemerintah desa.' },
  { name: 'Surat Kuasa', icon: 'users', color: 'purple', desc: 'Pemberian kuasa untuk mewakili urusan administrasi.' },
  { name: 'Surat Perintah', icon: 'send', color: 'red', desc: 'Perintah tugas atau pelaksanaan kegiatan tertentu.' },
  { name: 'Surat Edaran', icon: 'copy', color: 'yellow', desc: 'Penyampaian informasi resmi kepada pihak terkait.' },
  { name: 'Surat Undangan', icon: 'calendar', color: 'orange', desc: 'Undangan kegiatan, rapat, atau pertemuan resmi.' },
  { name: 'Surat Keterangan', icon: 'file', color: 'cyan', desc: 'Keterangan domisili, usaha, dan kebutuhan warga lainnya.' }
];

// ===== Koneksi Supabase =====
// anon key aman ditaruh di client — akses data tetap dibatasi oleh RLS di database.
const SUPABASE_URL = 'https://shcypfzjncnbrydwegcb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoY3lwZnpqbmNuYnJ5ZHdlZ2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NjM3MTMsImV4cCI6MjEwMjUzOTcxM30.9zrBTej-su1mdfrrU-rtirW_SJPExN7bU9pUQ4-BOp4';
// storage: sessionStorage supaya sesi otomatis habis saat tab/browser ditutup
// (sama seperti perilaku lama), bukan localStorage yang default dari Supabase.
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { storage: window.sessionStorage, persistSession: true, autoRefreshToken: true }
});

// Username login (mis. "kalekomaraa") dipetakan ke email dummy di Supabase Auth.
const emailFor = username => `${username.trim().toLowerCase()}@lapoltim.local`;

// ===== Format tanggal ala Indonesia dari timestamp Supabase (ISO string) =====
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_ID_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS_ID_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
function formatDateID(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}
function formatDateTimeID(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
  return `${formatDateID(iso)}, ${hh}:${mm} WITA`;
}
function timeAgoID(iso) {
  if (!iso) return '-';
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Baru saja';
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  return `${Math.floor(hr / 24)} hari lalu`;
}

function villageNameOf(v, fallback = 'Desa') {
  if (!v) return fallback;
  if (typeof v === 'string') return v || fallback;
  if (Array.isArray(v)) return v[0]?.name || fallback;
  if (typeof v === 'object') return v.name || fallback;
  return String(v);
}

const defaultTemplate = (type, villageNameRaw = 'Desa') => { const villageName = villageNameOf(villageNameRaw); return `PEMERINTAH KABUPATEN TAKALAR\nKECAMATAN POLONGBANGKENG TIMUR\n${villageName.toUpperCase()}\nAlamat: Jl. Poros Polongbangkeng Timur, Kabupaten Takalar\n\n${type.toUpperCase()}\nNomor: {{nomor_surat}}\n\nYang bertanda tangan di bawah ini, Pemerintah ${villageName}, menerangkan bahwa:\n\nNama            : {{nama_warga}}\nNIK             : {{nik}}\nTempat/Tgl Lahir: {{tempat_tanggal_lahir}}\nAlamat          : {{alamat}}\n\nDengan ini menerangkan bahwa surat ini dibuat untuk keperluan {{keperluan}} dan ditujukan kepada Pemerintah Kecamatan.\n\nDemikian surat ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.\n\n${villageName.replace('Desa ', '')}, {{tanggal}}\nKepala ${villageName}\n\n\n\n(____________________)`; };

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
  letters: [],
  incoming: [],
  residents: [],
  villages: [],
  accounts: [],
  templates: {},
  userId: null,
  currentVillageId: null,
  currentVillage: '',
  profileName: ''
};

// ===== Pemuatan data dari Supabase =====
// Setiap fungsi memetakan nama kolom tabel ke bentuk field lama yang dipakai
// fungsi render (mis. birth_place_date -> birth) supaya kode tampilan tidak
// perlu diubah banyak.

async function loadResidents() {
  const { data, error } = await sb.from('residents').select('*').eq('village_id', state.currentVillageId).order('created_at', { ascending: false });
  if (error) { toast('Gagal memuat data warga', error.message, 'error'); state.residents = []; return; }
  state.residents = (data || []).map(r => ({ nik: r.nik, name: r.name, gender: r.gender, birth: r.birth_place_date, address: r.address, status: r.family_status }));
}

async function loadLettersDesa() {
  const { data, error } = await sb.from('letters').select('*').eq('village_id', state.currentVillageId).order('created_at', { ascending: false });
  if (error) { toast('Gagal memuat surat', error.message, 'error'); state.letters = []; return; }
  state.letters = (data || []).map(mapLetterRow);
}

async function loadLettersCamat() {
  const { data, error } = await sb.from('letters').select('*, villages(name)').order('created_at', { ascending: false });
  if (error) { toast('Gagal memuat surat masuk', error.message, 'error'); state.incoming = []; return; }
  state.incoming = (data || []).map(row => mapLetterRow(row, row.villages));
}

function mapLetterRow(row, villageNameOverride) {
  return {
    id: row.id, number: row.number, type: row.letter_type, citizen: row.citizen_name, nik: row.resident_nik || '',
    village: villageNameOf(villageNameOverride, state.currentVillage || 'Desa'), purpose: row.purpose,
    date: formatDateID(row.created_at), status: row.status, reason: row.reason || '',
    updated: formatDateTimeID(row.updated_at), docxPath: row.docx_path || null, villageId: row.village_id
  };
}

async function loadTemplates() {
  const { data, error } = await sb.from('letter_templates').select('*').eq('village_id', state.currentVillageId);
  if (error) { toast('Gagal memuat template', error.message, 'error'); state.templates = {}; return; }
  const byType = Object.fromEntries((data || []).map(t => [t.letter_type, { content: t.content, docxPath: t.docx_path || null, edited: formatDateTimeID(t.updated_at) }]));
  state.templates = Object.fromEntries(LETTER_TYPES.map(t => [t.name, byType[t.name] || null]));
}

async function loadVillagesCamat() {
  const { data: villages, error } = await sb.from('villages').select('*').order('name');
  if (error) { toast('Gagal memuat daftar desa', error.message, 'error'); state.villages = []; state.accounts = []; return; }
  const { data: profiles } = await sb.from('profiles').select('*').eq('role', 'desa');
  const { data: residentCounts } = await sb.rpc('resident_counts');
  const { data: lettersAll } = await sb.from('letters').select('village_id,status,created_at');
  const residentCount = {}; (residentCounts || []).forEach(r => { residentCount[r.village_id] = Number(r.resident_count); });
  const incomingCount = {}; const lastActivity = {};
  (lettersAll || []).forEach(l => {
    if (['Terkirim', 'Diterima'].includes(l.status)) incomingCount[l.village_id] = (incomingCount[l.village_id] || 0) + 1;
    if (!lastActivity[l.village_id] || new Date(l.created_at) > new Date(lastActivity[l.village_id])) lastActivity[l.village_id] = l.created_at;
  });
  const profileByVillage = {}; (profiles || []).forEach(p => { profileByVillage[p.village_id] = p; });
  state.villages = (villages || []).map(v => ({
    id: v.id, name: v.name, district: v.district, status: v.status,
    residents: residentCount[v.id] || v.population || 0,
    incoming: incomingCount[v.id] || 0,
    admin: profileByVillage[v.id]?.full_name || '-',
    user: '-', phone: profileByVillage[v.id]?.phone || '-',
    active: lastActivity[v.id] ? timeAgoID(lastActivity[v.id]) : 'Belum ada aktivitas',
    created: formatDateID(v.created_at)
  }));
  state.accounts = state.villages.map(v => ({ ...v }));
}

async function loadAllForRole() {
  if (state.role === 'desa') {
    await Promise.all([loadResidents(), loadLettersDesa(), loadTemplates()]);
  } else if (state.role === 'camat') {
    await Promise.all([loadLettersCamat(), loadVillagesCamat()]);
  }
}

function updateSidebarIdentity() {
  const nameEl = document.getElementById('sidebar-village-name');
  if (nameEl) nameEl.textContent = state.currentVillage || 'Desa';
  const profileEl = document.getElementById('sidebar-profile-name');
  if (profileEl) profileEl.textContent = state.profileName || (state.role === 'camat' ? 'Admin Kecamatan' : 'Admin Desa');
  const avatarEl = document.getElementById('sidebar-avatar');
  if (avatarEl) avatarEl.textContent = initials(state.profileName || state.currentVillage || 'WG');
}

// Login: username -> email dummy, autentikasi ke Supabase Auth, lalu ambil
// profil (role + village_id) untuk menentukan tampilan & data yang dimuat.
async function doLogin(username, password) {
  const email = emailFor(username);
  const { data: authData, error: authError } = await sb.auth.signInWithPassword({ email, password });
  if (authError) { toast('Login gagal', 'Username atau kata sandi tidak sesuai.', 'error'); return; }
  const ok = await loadProfileAndEnter(authData.user.id);
  if (!ok) { await sb.auth.signOut(); }
}

async function loadProfileAndEnter(userId) {
  const { data: profile, error } = await sb.from('profiles').select('*, villages(name)').eq('id', userId).single();
  if (error || !profile) { toast('Login gagal', 'Profil akun tidak ditemukan. Hubungi administrator.', 'error'); return false; }
  if (profile.role !== PORTAL) { toast('Login gagal', `Akun ini bukan akun ${PORTAL === 'camat' ? 'kecamatan' : 'desa'}.`, 'error'); return false; }
  state.userId = userId;
  state.role = profile.role;
  state.profileName = profile.full_name || '';
  state.currentVillageId = profile.village_id || null;
  state.currentVillage = profile.villages?.name || '';
  state.page = 'dashboard';
  await loadAllForRole();
  renderApp();
  updateSidebarIdentity();
  toast('Selamat datang', `Login ${state.currentVillage || 'Kecamatan Polongbangkeng Timur'} berhasil.`);
  return true;
}

async function doLogout() {
  await sb.auth.signOut();
  Object.assign(state, { role: null, page: 'dashboard', mobileOpen: false, userId: null, currentVillageId: null, currentVillage: '', profileName: '', residents: [], letters: [], incoming: [], villages: [], accounts: [], templates: {} });
  showView('login');
  toast('Anda telah keluar', 'Sesi berakhir dengan aman.');
}

function toast(title, message, type = 'success') {
  const root = $('#toast-root');
  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'error' : ''}`;
  el.innerHTML = `<div class="toast-icon">${icon(type === 'error' ? 'x' : 'check', 'sm')}</div><div><strong>${esc(title)}</strong><p>${esc(message)}</p></div>`;
  root.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(12px)'; setTimeout(() => el.remove(), 220); }, 3300);
}

// Markup login & shell sudah statis di desa.html / camat.html.
// Di sini JS cuma menentukan mana yang tampil.
function showView(view) {
  $('#login-view').style.display = view === 'login' ? '' : 'none';
  $('#app-view').style.display = view === 'app' ? '' : 'none';
}

const pageTitles = { dashboard: 'Beranda', inventory: 'Inventaris Surat', residents: 'Data Warga', status: 'Status Surat', templates: 'Template Surat', history: 'Riwayat', incoming: 'Surat Masuk', villages: 'Daftar Desa', accounts: 'Akun Desa' };

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
  updateNavBadges();
}

// Badge di sidebar & titik notifikasi bel dulunya angka statis di HTML.
// Di sini dihitung ulang dari data Supabase yang sudah dimuat, tiap kali app
// dirender ulang (login, aksi CRUD, refresh), supaya selalu mengikuti isi.
function setNavBadge(page, count) {
  const el = document.querySelector(`.nav-item[data-page="${page}"] .nav-badge`);
  if (!el) return;
  if (count > 0) { el.textContent = count > 99 ? '99+' : count; el.style.display = ''; }
  else { el.style.display = 'none'; }
}
function updateNavBadges() {
  const bell = $('.notification-btn');
  if (state.role === 'desa') {
    setNavBadge('inventory', LETTER_TYPES.length);
    setNavBadge('status', state.letters.filter(l => ['Terkirim', 'Diterima'].includes(l.status)).length);
    if (bell) bell.classList.toggle('has-notif', state.letters.length > 0);
  } else if (state.role === 'camat') {
    setNavBadge('incoming', state.incoming.filter(l => ['Terkirim', 'Diterima'].includes(l.status)).length);
    setNavBadge('villages', state.villages.length);
    if (bell) bell.classList.toggle('has-notif', state.incoming.length > 0);
  }
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
        try { el.setSelectionRange(focusInfo.start, focusInfo.end); } catch { }
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
    return ({ dashboard: renderVillageDashboard, inventory: renderInventory, residents: renderResidents, status: renderStatus, templates: renderTemplates, history: renderHistory })[state.page]();
  }
  return ({ dashboard: renderCamatDashboard, incoming: renderIncoming, villages: renderVillages, accounts: renderAccounts, history: renderHistory })[state.page]();
}

function pageHeader(title, subtitle, actions = '') {
  return `<div class="page-header"><div><h1>${title}</h1><p>${subtitle}</p></div>${actions ? `<div class="header-actions">${actions}</div>` : ''}</div>`;
}

function statCard(iconName, label, value, trend, color = '') {
  return `<div class="stat-card"><div class="stat-top"><span class="stat-icon ${color}">${icon(iconName)}</span><span class="trend ${trend.startsWith('-') ? 'down' : ''}">${trend}</span></div><div class="value">${value}</div><div class="label">${label}</div></div>`;
}

function recentTable(items, camat = false) {
  return `<div class="table-card"><table class="data-table"><thead><tr><th>Nomor / Jenis</th>${camat ? '<th>Asal desa</th>' : '<th>Warga</th>'}<th>Tanggal</th><th>Status</th><th></th></tr></thead><tbody>${items.map(l => `<tr><td><span class="primary">${esc(l.number)}</span><span class="secondary">${esc(l.type)}</span></td><td>${camat ? `<span class="primary">${esc(l.village)}</span><span class="secondary">${esc(l.citizen)}</span>` : `<span class="primary">${esc(l.citizen)}</span><span class="secondary">${esc(l.nik)}</span>`}</td><td>${esc(l.date)}</td><td>${statusBadge(l.status)}</td><td><div class="table-actions"><button class="icon-btn" data-action="${camat ? 'review-letter' : 'view-letter'}" data-id="${l.id}" title="Lihat detail">${icon('eye', 'sm')}</button></div></td></tr>`).join('')}</tbody></table></div>`;
}

function renderVillageDashboard() {
  const counts = countStatuses(state.letters);
  return `${pageHeader(`Selamat datang, ${state.profileName || 'Admin Desa'}`, `Berikut ringkasan layanan administrasi ${state.currentVillage} hari ini.`, `<button class="btn btn-primary" data-action="new-letter">${icon('plus', 'sm')} Buat surat baru</button>`)}
    <section class="welcome-banner"><div class="welcome-copy"><span class="mini">Pelayanan desa digital</span><h2>Layani warga lebih cepat hari ini.</h2><p>Buat usulan surat, kirim ke kecamatan, lalu pantau prosesnya secara transparan tanpa berkas berulang.</p><button class="btn" data-page="inventory">Mulai buat surat ${icon('chevron-right', 'sm')}</button></div><div class="banner-art"><img src="assets/images/banner-desa.svg" alt="Ilustrasi kantor desa"></div></section>
    <div class="stats-grid">${statCard('users', 'Total warga terdata', state.residents.length.toLocaleString('id-ID'), '+4.2%')}${statCard('file', 'Surat bulan ini', state.letters.length, '+12%', 'blue')}${statCard('clock', 'Menunggu proses', counts['Terkirim'] + counts['Diterima'], '-2.1%', 'orange')}${statCard('check', 'Surat disetujui', counts['Disetujui'], '+8.4%', 'purple')}</div>
    <div class="dashboard-grid"><div>
      <section class="panel mb-14"><div class="panel-head"><div><h3>Aksi cepat</h3><p>Akses layanan yang sering digunakan</p></div></div><div class="panel-body"><div class="quick-actions">
        <button class="quick-action" data-action="new-letter"><span class="stat-icon">${icon('plus', 'sm')}</span><span><strong>Buat surat</strong><span>Ajukan surat warga</span></span></button>
        <button class="quick-action" data-action="add-resident"><span class="stat-icon blue">${icon('user-plus', 'sm')}</span><span><strong>Tambah warga</strong><span>Input data penduduk</span></span></button>
        <button class="quick-action" data-page="status"><span class="stat-icon orange">${icon('history', 'sm')}</span><span><strong>Lacak surat</strong><span>Pantau status usulan</span></span></button>
      </div></div></section>
      <section class="panel"><div class="panel-head"><div><h3>Surat terbaru</h3><p>Usulan surat yang terakhir diperbarui</p></div><button class="see-all" data-page="status">Lihat semua ${icon('chevron-right', 'sm')}</button></div>${recentTable(state.letters.slice(0, 5))}</section>
    </div><div>
      <section class="panel mb-14"><div class="panel-head"><div><h3>Ringkasan status</h3><p>Progres surat bulan Agustus</p></div><span class="badge approved">Aktif</span></div><div class="panel-body"><div class="status-list">
        ${statusProgress('Disetujui', counts['Disetujui'], pct(counts['Disetujui'], state.letters.length), '')}${statusProgress('Diterima', counts['Diterima'], pct(counts['Diterima'], state.letters.length), 'blue')}${statusProgress('Terkirim', counts['Terkirim'], pct(counts['Terkirim'], state.letters.length), 'orange')}${statusProgress('Ditolak', counts['Ditolak'], pct(counts['Ditolak'], state.letters.length), 'red')}
      </div></div></section>
      <section class="panel"><div class="panel-head"><div><h3>Aktivitas terbaru</h3><p>Pembaruan layanan hari ini</p></div></div><div class="panel-body activity-list">
        ${activity('check', 'Surat disetujui', 'Surat undangan H. Jamaluddin siap diambil.', '15 menit lalu')}
        ${activity('send', 'Surat berhasil dikirim', 'Permohonan Muh. Akbar telah terkirim.', '1 jam lalu')}
        ${activity('user-plus', 'Data warga ditambah', 'Data keluarga baru berhasil disimpan.', '3 jam lalu')}
      </div></section>
    </div></div>`;
}

function statusProgress(label, count, width, color) {
  return `<div class="status-row"><i class="status-dot ${color}"></i><span>${label}</span><strong>${count}</strong><div class="progress"><i class="${color}" style="width:${Math.max(width, 8)}%"></i></div></div>`;
}
function pct(count, total) { return total ? Math.round(count / total * 100) : 0; }
function activity(ic, title, text, time) { return `<div class="activity-item"><span class="activity-icon">${icon(ic, 'sm')}</span><div class="activity-copy"><strong>${title}</strong><p>${text}</p><time>${time}</time></div></div>`; }
function countStatuses(items) { return ['Terkirim', 'Diterima', 'Disetujui', 'Ditolak'].reduce((a, s) => (a[s] = items.filter(x => x.status === s).length, a), {}); }
function statusBadge(status) { const c = { Terkirim: 'sent', Diterima: 'received', Disetujui: 'approved', Ditolak: 'rejected' }[status] || 'sent'; return `<span class="badge ${c}">${status}</span>`; }

// ===== Paginasi generik: dipakai semua tabel/daftar =====
function paginate(items, scope, perPage = 8) {
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
  for (let i = 1; i <= totalPages; i++) nums.push(i);
  const btns = `<button class="page-btn" data-action="paginate" data-scope="${scope}" data-dir="prev" ${page === 1 ? 'disabled' : ''}>‹</button>`
    + nums.map(i => `<button class="page-btn ${i === page ? 'active' : ''}" data-action="paginate" data-scope="${scope}" data-num="${i}">${i}</button>`).join('')
    + `<button class="page-btn" data-action="paginate" data-scope="${scope}" data-dir="next" ${page === totalPages ? 'disabled' : ''}>›</button>`;
  return `<div class="pagination"><span>${label}</span><div class="page-buttons">${btns}</div></div>`;
}

// ===== Ekspor CSV sederhana (tanpa backend) =====
function downloadCsv(filename, rows) {
  const csv = rows.map(row => row.map(cell => {
    const v = String(cell ?? '');
    return /[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(';')).join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function exportData(kind) {
  if (kind === 'residents') {
    downloadCsv('data-warga-barugaya.csv', [['NIK', 'Nama', 'Jenis Kelamin', 'Tempat Tanggal Lahir', 'Alamat', 'Status Keluarga'], ...state.residents.map(r => [r.nik, r.name, r.gender, r.birth, r.address, r.status])]);
  } else if (kind === 'status') {
    const filtered = state.statusFilter === 'Semua' ? state.letters : state.letters.filter(l => l.status === state.statusFilter);
    downloadCsv('laporan-status-surat.csv', [['Nomor', 'Jenis', 'Nama Warga', 'NIK', 'Tanggal', 'Status', 'Catatan'], ...filtered.map(l => [l.number, l.type, l.citizen, l.nik, l.date, l.status, l.reason])]);
  } else if (kind === 'incoming') {
    const filtered = state.letterFilter === 'Semua' ? state.incoming : state.incoming.filter(l => l.status === state.letterFilter);
    downloadCsv('surat-masuk-kecamatan.csv', [['Nomor', 'Jenis', 'Asal Desa', 'Nama Warga', 'NIK', 'Dikirim', 'Status', 'Catatan'], ...filtered.map(l => [l.number, l.type, l.village, l.citizen, l.nik, l.date, l.status, l.reason])]);
  } else if (kind === 'history') {
    const items = state.role === 'desa' ? state.letters : state.incoming;
    const filtered = items.filter(l => ['Disetujui', 'Ditolak'].includes(l.status));
    downloadCsv('riwayat-surat.csv', [['Tanggal Keputusan', 'Nomor', 'Jenis', 'Warga/Desa', 'Status', 'Catatan'], ...filtered.map(l => [l.updated, l.number, l.type, state.role === 'camat' ? l.village : l.citizen, l.status, l.reason])]);
  } else if (kind === 'accounts') {
    downloadCsv('akun-desa.csv', [['Desa', 'Admin', 'Username', 'Kontak', 'Dibuat', 'Status'], ...state.accounts.map(a => [a.name, a.admin, a.user, a.phone, a.created, a.status])]);
  }
  toast('Berkas diunduh', 'File CSV berhasil dibuat dan diunduh ke perangkat Anda.');
}

// ===== Rendering template surat: konten yang diedit di halaman Template
// benar-benar dipakai saat surat dibuat/dicetak (bukan cuma dekorasi). =====
function fillTemplateVars(letter) {
  const resident = state.residents.find(r => r.nik === letter.nik);
  const villageName = letter.village || state.currentVillage || 'Desa';
  return {
    nomor_surat: letter.number || '', nama_warga: letter.citizen || '', nik: letter.nik || '',
    tempat_tanggal_lahir: resident?.birth || '-',
    alamat: resident?.address || `${villageName}, Kecamatan Polongbangkeng Timur`,
    keperluan: letter.purpose || '-', tanggal: letter.date || ''
  };
}
function renderTemplateBody(letter) {
  const tpl = state.templates[letter.type]?.content || defaultTemplate(letter.type, letter.village || state.currentVillage);
  const vars = fillTemplateVars(letter);
  let text = esc(tpl).replace(/\{\{(\w+)\}\}/g, (m, key) => key in vars ? esc(vars[key]) : m);
  text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/__(.+?)__/g, '<u>$1</u>').replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<i>$1</i>');
  return text.split('\n').map(line => line.trim() === '' ? '<br>' : `<p>${line}</p>`).join('');
}

// PENTING (perbaikan bug "pratinjau nggak mirip Word"): sebelumnya pratinjau
// dibuat pakai mammoth.js, yang cuma mengubah docx jadi teks semi-polos —
// perataan tengah, tabel, ukuran font, dsb TIDAK ikut terbawa, jadi hasilnya
// beda jauh dari tampilan asli di Microsoft Word.
//
// Sekarang dipakai docx-preview, library yang memang dibuat untuk menggambar
// ulang file .docx di browser SEPERSIS mungkin dengan Word (kop surat rata
// tengah, tebal/miring, tabel, ukuran halaman, dst). docx-preview harus
// menggambar ke elemen <div> yang benar-benar ada di halaman (bukan cuma
// mengembalikan teks) — makanya kita render dulu ke elemen sementara yang
// disisipkan tersembunyi di body, lalu ambil hasilnya jadi HTML biasa yang
// bisa ditempel ke mana saja (modal, overlay pratinjau, jendela cetak).
function docxFallbackHtml(letter) {
  return `<div class="document-paper"><div class="doc-seal-row"><span class="doc-seal">T</span></div><div class="doc-body">${renderTemplateBody(letter)}</div></div>`;
}
async function renderDocumentBodyHtml(letter, opts = {}) {
  // Dipakai khusus tombol "Edit teks manual (lanjutan) -> Pratinjau": di situ
  // pengguna sengaja mau lihat teks manual yang lagi diketik, bukan isi file
  // .docx (unggahan atau bawaan) — jadi jangan sentuh docx sama sekali.
  if (opts.forceManualText) return docxFallbackHtml(letter);
  let wrap = null;
  try {
    const villageId = letter.villageId || state.currentVillageId;
    const buf = await getTemplateDocxBuffer(letter.type, villageId);
    const docTemplater = newDocxtemplater(buf);
    docTemplater.render({ ...fillTemplateVars(letter), jenis_surat: letter.type, nama_desa: letter.village || state.currentVillage });
    const outBlob = docTemplater.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    // Dirender di elemen tersembunyi (bukan display:none, biar ukuran teks
    // tetap terhitung benar) supaya docx-preview bisa menggambar dengan
    // ukuran/posisi yang akurat sebelum kita ambil hasilnya.
    wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;left:-9999px;top:0;width:600px;opacity:0;pointer-events:none;';
    document.body.appendChild(wrap);
    await window.docx.renderAsync(outBlob, wrap, wrap, {
      className: 'sipindu-docx', inWrapper: true, ignoreWidth: true, ignoreHeight: true,
      experimental: true, breakPages: false, renderHeaders: true, renderFooters: true
    });
    const html = wrap.innerHTML;
    return html && html.trim() ? `<div class="docx-preview-host">${html}</div>` : docxFallbackHtml(letter);
  } catch (err) {
    return docxFallbackHtml(letter);
  } finally {
    if (wrap) wrap.remove();
  }
}

function renderInventory() {
  const counts = Object.fromEntries(LETTER_TYPES.map(t => [t.name, state.letters.filter(l => l.type === t.name).length]));
  return `${pageHeader('Inventaris Surat', 'Pilih jenis surat yang ingin dibuat dan diajukan ke kecamatan.', `<button class="btn btn-outline" data-page="templates">${icon('template', 'sm')} Kelola template</button><button class="btn btn-primary" data-action="new-letter">${icon('plus', 'sm')} Buat surat</button>`)}
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search', 'sm')}</span><input id="inventory-search" placeholder="Cari jenis surat..."></div><div class="toolbar-spacer"></div><span class="small-note">${icon('info', 'sm')} 7 template siap digunakan</span></div>
    <div class="inventory-grid" id="inventory-grid">${LETTER_TYPES.map(t => `<article class="letter-card color-${t.color}" data-letter-name="${t.name.toLowerCase()}"><div class="letter-card-top"><span class="letter-icon">${icon(t.icon, 'lg')}</span><span class="template-ready">${icon('check', 'sm')} Template aktif</span></div><h3>${t.name}</h3><p>${t.desc}</p><div class="letter-meta"><span>${counts[t.name] || 0} surat dibuat</span><button class="btn btn-sm btn-secondary" data-action="new-letter" data-type="${t.name}">Buat surat ${icon('chevron-right', 'sm')}</button></div></article>`).join('')}</div>`;
}

function renderResidents() {
  const q = state.residentSearch.toLowerCase();
  const filtered = state.residents.filter(r =>
    (!q || `${r.name} ${r.nik} ${r.address}`.toLowerCase().includes(q)) &&
    (!state.residentDusun || r.address.includes(state.residentDusun)) &&
    (!state.residentGender || r.gender === state.residentGender)
  );
  const male = state.residents.filter(r => r.gender === 'Laki-laki').length;
  const female = state.residents.filter(r => r.gender === 'Perempuan').length;
  const heads = state.residents.filter(r => r.status === 'Kepala Keluarga').length;
  const { pageItems, page, totalPages } = paginate(filtered, 'residents', 8);
  const hasFilter = state.residentSearch || state.residentDusun || state.residentGender;
  return `${pageHeader('Data Warga', `Kelola data penduduk ${state.currentVillage} sebagai sumber pengisian surat.`, `<button class="btn btn-outline" data-action="export" data-export="residents">${icon('download', 'sm')} Ekspor data</button><button class="btn btn-primary" data-action="add-resident">${icon('user-plus', 'sm')} Tambah warga</button>`)}
    <div class="stats-grid">${statCard('users', 'Total warga terdata', state.residents.length.toLocaleString('id-ID'), `${heads} KK`)}${statCard('user', 'Laki-laki', male, `${state.residents.length ? Math.round(male / state.residents.length * 100) : 0}%`, 'blue')}${statCard('user', 'Perempuan', female, `${state.residents.length ? Math.round(female / state.residents.length * 100) : 0}%`, 'purple')}${statCard('home', 'Kepala keluarga', heads, 'terdata', 'orange')}</div>
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search', 'sm')}</span><input id="resident-search" value="${esc(state.residentSearch)}" placeholder="Cari nama atau NIK..."></div><div style="width:170px">${comboboxHtml({ name: 'dusun-filter', id: 'dusun-filter', readOnly: true, size: 'combobox-sm', selectedValue: state.residentDusun, options: [{ value: '', label: 'Semua dusun' }, { value: 'Dusun Barugaya', label: 'Dusun Barugaya' }, { value: 'Dusun Panaikang', label: 'Dusun Panaikang' }, { value: 'Dusun Bontomanai', label: 'Dusun Bontomanai' }] })}</div><div style="width:170px">${comboboxHtml({ name: 'gender-filter', id: 'gender-filter', readOnly: true, size: 'combobox-sm', selectedValue: state.residentGender, options: [{ value: '', label: 'Semua jenis kelamin' }, { value: 'Laki-laki', label: 'Laki-laki' }, { value: 'Perempuan', label: 'Perempuan' }] })}</div><div class="toolbar-spacer"></div><button class="btn btn-sm btn-outline" data-action="reset-filter" data-scope="residents" ${hasFilter ? '' : 'disabled'}>${icon('x', 'sm')} Reset filter</button></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>NIK</th><th>Nama warga</th><th>Jenis kelamin</th><th>Tempat, tanggal lahir</th><th>Alamat</th><th>Status keluarga</th><th></th></tr></thead><tbody>${pageItems.length ? pageItems.map((r, i) => `<tr><td class="primary">${esc(r.nik)}</td><td><div class="table-user"><span class="avatar ${i % 2 ? 'green' : ''}">${initials(r.name)}</span><span class="primary">${esc(r.name)}</span></div></td><td>${esc(r.gender)}</td><td>${esc(r.birth)}</td><td>${esc(r.address)}</td><td>${esc(r.status)}</td><td><div class="table-actions"><button class="icon-btn" data-action="view-resident" data-nik="${r.nik}">${icon('eye', 'sm')}</button><button class="icon-btn" data-action="edit-resident" data-nik="${r.nik}">${icon('edit', 'sm')}</button><button class="icon-btn icon-btn-danger" data-action="delete-resident" data-nik="${r.nik}" title="Hapus warga">${icon('x', 'sm')}</button></div></td></tr>`).join('') : `<tr><td colspan="7" class="empty-row">Tidak ada warga yang cocok dengan filter ini.</td></tr>`}</tbody></table>${paginationHtml('residents', page, totalPages, `Menampilkan ${pageItems.length} dari ${filtered.length} warga`)}</div>`;
}
function initials(name) { return name.replace(/[^A-Za-zÀ-ÿ ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'WG'; }

function monthAbbr(name) { return { 'Agustus': 'Agu', 'Juli': 'Jul' }[name] || name.slice(0, 3); }
function matchesMonth(dateStr, monthLabel) {
  if (!monthLabel) return true;
  const [name, year] = monthLabel.split(' ');
  return dateStr.endsWith(`${monthAbbr(name)} ${year}`);
}

function renderStatus() {
  const counts = countStatuses(state.letters);
  const q = (state.statusSearch || '').toLowerCase();
  const filtered = state.letters.filter(l =>
    (state.statusFilter === 'Semua' || l.status === state.statusFilter) &&
    matchesMonth(l.date, state.statusMonth) &&
    (!q || `${l.number} ${l.type} ${l.citizen}`.toLowerCase().includes(q))
  );
  const { pageItems, page, totalPages } = paginate(filtered, 'status', 8);
  return `${pageHeader('Status Surat', 'Pantau progres setiap usulan beserta catatan atau alasan dari kecamatan.', `<button class="btn btn-primary" data-action="new-letter">${icon('plus', 'sm')} Buat surat baru</button>`)}
    <div class="status-summary">${statusMini('Terkirim', counts.Terkirim, 'blue')}${statusMini('Diterima', counts.Diterima, 'orange')}${statusMini('Disetujui', counts.Disetujui, '')}${statusMini('Ditolak', counts.Ditolak, 'red')}</div>
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search', 'sm')}</span><input id="status-search" value="${esc(state.statusSearch || '')}" placeholder="Cari nomor, jenis, atau warga..."></div><div style="width:150px">${comboboxHtml({ name: 'status-filter', id: 'status-filter', readOnly: true, size: 'combobox-sm', selectedValue: state.statusFilter, options: ['Semua', 'Terkirim', 'Diterima', 'Disetujui', 'Ditolak'].map(s => ({ value: s, label: s })) })}</div><div style="width:150px">${comboboxHtml({ name: 'status-month', id: 'status-month', readOnly: true, size: 'combobox-sm', selectedValue: state.statusMonth, options: [{ value: '', label: 'Semua bulan' }, { value: 'Agustus 2026', label: 'Agustus 2026' }, { value: 'Juli 2026', label: 'Juli 2026' }] })}</div><div class="toolbar-spacer"></div><button class="btn btn-sm btn-outline" data-action="export" data-export="status">${icon('download', 'sm')} Unduh laporan</button></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>Nomor / Jenis</th><th>Nama warga</th><th>Tanggal</th><th>Status</th><th>Catatan / alasan</th><th></th></tr></thead><tbody>${pageItems.length ? pageItems.map(l => `<tr><td><span class="primary">${esc(l.number)}</span><span class="secondary">${esc(l.type)}</span></td><td><span class="primary">${esc(l.citizen)}</span><span class="secondary">${esc(l.nik)}</span></td><td>${esc(l.date)}<span class="secondary">Diperbarui ${esc(l.updated)}</span></td><td>${statusBadge(l.status)}</td><td><div class="reason">${icon('info', 'sm')}<span>${esc(l.reason)}</span></div></td><td><div class="table-actions"><button class="icon-btn" data-action="view-letter" data-id="${l.id}">${icon('eye', 'sm')}</button><button class="icon-btn" data-action="download-letter-docx" data-id="${l.id}" title="Unduh dokumen Word">${icon('download', 'sm')}</button>${l.status === 'Disetujui' ? `<button class="icon-btn" data-action="print-letter" data-id="${l.id}">${icon('printer', 'sm')}</button>` : ''}</div></td></tr>`).join('') : `<tr><td colspan="6" class="empty-row">Tidak ada surat yang cocok dengan filter ini.</td></tr>`}</tbody></table>${paginationHtml('status', page, totalPages, `Menampilkan ${pageItems.length} dari ${filtered.length} surat`)}</div>`;
}
function statusMini(label, count, color) { return `<div class="status-mini"><i class="status-dot ${color}"></i><div><strong>${count}</strong><span>${label}</span></div></div>`; }

function renderTemplates() {
  return `${pageHeader('Template Surat', 'Unduh format Word, edit bebas seperti biasa, lalu unggah kembali. Tersimpan otomatis untuk setiap pengajuan.', `<button class="btn btn-outline" data-action="template-guide">${icon('info', 'sm')} Panduan variabel</button>`)}
    <div class="small-note mb-14">${icon('info', 'sm')} Buka file Word yang diunduh, edit format/logo/kop surat sesuka hati, jangan hapus variabel seperti <b>{{nama_warga}}</b>, <b>{{nik}}</b>, dan <b>{{keperluan}}</b> — bagian itu akan terisi otomatis saat surat dibuat.</div>
    <div class="template-grid">${LETTER_TYPES.map(t => {
      const tpl = state.templates[t.name]; const isWord = !!tpl?.docxPath;
      return `<article class="template-card color-${t.color}"><div class="template-preview"><div class="paper-mini"><i class="paper-logo"></i><i class="paper-line dark"></i><i class="paper-line short"></i><br><i class="paper-line"></i><i class="paper-line"></i><i class="paper-line"></i><i class="paper-line short"></i></div></div><div class="template-info">
        <span class="badge ${isWord ? 'approved' : 'sent'}">${icon(isWord ? 'check' : 'file', 'sm')} ${isWord ? 'Format Word aktif' : 'Format dasar (belum diunggah)'}</span>
        <h3>${t.name}</h3><p>Format baku ${t.name.toLowerCase()} ${state.currentVillage} untuk pengajuan ke kecamatan.</p>
        <div class="template-footer">
          <span class="edited">${isWord ? `Diunggah ${esc(tpl.edited || '-')}` : 'Pakai template dasar bawaan SIPINDU'}</span>
          <div class="template-actions">
            <button class="btn btn-sm btn-outline" data-action="download-template" data-type="${t.name}">${icon('download', 'sm')} Unduh Word</button>
            <label class="btn btn-sm btn-secondary file-upload-btn">Unggah Word<input type="file" accept=".docx" class="hidden-file-input" data-upload-type="${t.name}"></label>
          </div>
        </div>
        <button type="button" class="text-link" data-action="edit-template" data-type="${t.name}" style="margin-top:8px">Edit teks manual (lanjutan)</button>
      </div></article>`;
    }).join('')}</div>`;
}

function renderHistory() {
  const items = state.role === 'desa' ? state.letters : state.incoming;
  const q = (state.historySearch || '').toLowerCase();
  const filtered = items.filter(l => ['Disetujui', 'Ditolak'].includes(l.status))
    .filter(l => !state.historyStatusFilter || l.status === state.historyStatusFilter)
    .filter(l => !state.historyVillageFilter || l.village === state.historyVillageFilter)
    .filter(l => matchesMonth(l.updated, state.historyMonth))
    .filter(l => !q || `${l.number} ${l.type} ${l.citizen || ''} ${l.village || ''}`.toLowerCase().includes(q));
  const { pageItems, page, totalPages } = paginate(filtered, 'history', 8);
  return `${pageHeader('Riwayat Persuratan', `Arsip keputusan surat yang telah selesai diproses ${state.role === 'desa' ? `untuk ${state.currentVillage}` : 'oleh Kecamatan Polongbangkeng Timur'}.`, `<button class="btn btn-outline" data-action="export" data-export="history">${icon('download', 'sm')} Ekspor riwayat</button>`)}
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search', 'sm')}</span><input id="history-search" value="${esc(state.historySearch || '')}" placeholder="Cari riwayat surat..."></div><div style="width:150px">${comboboxHtml({ name: 'history-status-filter', id: 'history-status-filter', readOnly: true, size: 'combobox-sm', selectedValue: state.historyStatusFilter, options: [{ value: '', label: 'Semua status' }, { value: 'Disetujui', label: 'Disetujui' }, { value: 'Ditolak', label: 'Ditolak' }] })}</div>${state.role === 'camat' ? `<div style="width:190px">${comboboxHtml({ name: 'history-village-filter', id: 'history-village-filter', selectedValue: state.historyVillageFilter, options: state.villages.map(v => ({ value: v.name, label: v.name })), placeholder: 'Semua desa', size: 'combobox-sm' })}</div>` : ''}<div style="width:150px">${comboboxHtml({ name: 'history-month', id: 'history-month', readOnly: true, size: 'combobox-sm', selectedValue: state.historyMonth, options: [{ value: '', label: 'Semua bulan' }, { value: 'Agustus 2026', label: 'Agustus 2026' }, { value: 'Juli 2026', label: 'Juli 2026' }] })}</div><div class="toolbar-spacer"></div></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>Tanggal keputusan</th><th>Nomor / jenis</th>${state.role === 'camat' ? '<th>Asal desa</th>' : '<th>Nama warga</th>'}<th>Status akhir</th><th>Alasan / catatan keputusan</th><th></th></tr></thead><tbody>${pageItems.length ? pageItems.map(l => `<tr><td>${esc(l.updated)}</td><td><span class="primary">${esc(l.number)}</span><span class="secondary">${esc(l.type)}</span></td><td><span class="primary">${esc(state.role === 'camat' ? l.village : l.citizen)}</span><span class="secondary">${esc(l.nik)}</span></td><td>${statusBadge(l.status)}</td><td><div class="reason">${icon('info', 'sm')}<span>${esc(l.reason)}</span></div></td><td><div class="table-actions"><button class="icon-btn" data-action="${state.role === 'camat' ? 'review-letter' : 'view-letter'}" data-id="${l.id}">${icon('eye', 'sm')}</button><button class="icon-btn" data-action="print-letter" data-id="${l.id}">${icon('download', 'sm')}</button></div></td></tr>`).join('') : `<tr><td colspan="6" class="empty-row">Belum ada riwayat yang cocok dengan filter ini.</td></tr>`}</tbody></table>${paginationHtml('history', page, totalPages, `${filtered.length} riwayat keputusan`)}</div>`;
}

function renderCamatDashboard() {
  const counts = countStatuses(state.incoming); const totalResidents = state.villages.reduce((a, v) => a + v.residents, 0);
  return `${pageHeader('Selamat datang di Portal Kecamatan', 'Pantau layanan desa dan selesaikan peninjauan surat hari ini.', `<button class="btn btn-primary" data-page="incoming">${icon('mail', 'sm')} Tinjau surat masuk</button>`)}
    <section class="welcome-banner"><div class="welcome-copy"><span class="mini">Pusat kendali kecamatan</span><h2>Ada ${counts.Terkirim} surat baru menunggu tinjauan.</h2><p>Periksa kelengkapan berkas dari desa dan berikan keputusan beserta alasan agar layanan warga tetap transparan.</p><button class="btn" data-page="incoming">Buka antrean surat ${icon('chevron-right', 'sm')}</button></div><div class="banner-art"><img src="assets/images/banner-camat.svg" alt="Ilustrasi kantor kecamatan"></div></section>
    <div class="stats-grid">${statCard('village', 'Desa terpantau', state.villages.length, `${state.villages.filter(v => v.status === 'Aktif').length} aktif`)}${statCard('users', 'Warga terdata', totalResidents.toLocaleString('id-ID'), '+3.8%', 'blue')}${statCard('mail', 'Surat masuk bulan ini', state.incoming.length, '+14%', 'orange')}${statCard('check', 'Tingkat persetujuan', `${state.incoming.length ? Math.round(counts['Disetujui'] / state.incoming.length * 100) : 0}%`, '+2.4%', 'purple')}</div>
    <div class="dashboard-grid"><div>
      <section class="panel mb-14"><div class="panel-head"><div><h3>Surat perlu ditinjau</h3><p>Urut berdasarkan waktu pengiriman terbaru</p></div><button class="see-all" data-page="incoming">Lihat semua ${icon('chevron-right', 'sm')}</button></div>${recentTable(state.incoming.filter(x => ['Terkirim', 'Diterima'].includes(x.status)).slice(0, 5), true)}</section>
      <section class="panel"><div class="panel-head"><div><h3>Pantauan desa</h3><p>Ringkasan penduduk dan surat masuk</p></div><button class="see-all" data-page="villages">Semua desa ${icon('chevron-right', 'sm')}</button></div><div class="panel-body"><div class="quick-actions">${state.villages.slice(0, 3).map(v => `<button class="quick-action" data-action="view-village" data-village="${v.name}"><span class="village-avatar">${icon('village', 'sm')}${v.incoming ? `<i class="incoming-count">${v.incoming}</i>` : ''}</span><span><strong>${v.name.replace('Desa ', '')}</strong><span>${v.residents.toLocaleString('id-ID')} warga · ${v.incoming} masuk</span></span></button>`).join('')}</div></div></section>
    </div><div>
      <section class="panel mb-14"><div class="panel-head"><div><h3>Status surat</h3><p>Distribusi bulan ini</p></div><span class="badge approved">Real-time</span></div><div class="panel-body"><div class="status-list">${statusProgress('Disetujui', counts.Disetujui, pct(counts.Disetujui, state.incoming.length), '')}${statusProgress('Diterima', counts.Diterima, pct(counts.Diterima, state.incoming.length), 'blue')}${statusProgress('Terkirim', counts.Terkirim, pct(counts.Terkirim, state.incoming.length), 'orange')}${statusProgress('Ditolak', counts.Ditolak, pct(counts.Ditolak, state.incoming.length), 'red')}</div></div></section>
      <section class="panel"><div class="panel-head"><div><h3>Aktivitas petugas</h3><p>Pembaruan keputusan hari ini</p></div></div><div class="panel-body activity-list">${activity('check', 'Surat disetujui', 'Penetapan kader dari Desa Timbuseng.', '28 menit lalu')}${activity('mail', 'Berkas diterima', 'Undangan dari Desa Massamaturu.', '1 jam lalu')}${activity('x', 'Surat dikembalikan', 'Edaran Desa Kale Ko’mara perlu diperbaiki.', '2 jam lalu')}</div></section>
    </div></div>`;
}

function renderIncoming() {
  const counts = countStatuses(state.incoming);
  const q = (state.incomingSearch || '').toLowerCase();
  const filtered = state.incoming.filter(l =>
    (state.letterFilter === 'Semua' || l.status === state.letterFilter) &&
    (!state.villageFilter || l.village === state.villageFilter) &&
    (!q || `${l.number} ${l.citizen} ${l.village}`.toLowerCase().includes(q))
  );
  const { pageItems, page, totalPages } = paginate(filtered, 'incoming', 8);
  const hasFilter = state.incomingSearch || (state.letterFilter && state.letterFilter !== 'Semua') || state.villageFilter;
  return `${pageHeader('Surat Masuk', 'Tinjau usulan desa, putuskan status, dan berikan alasan yang jelas.', `<button class="btn btn-outline" data-action="refresh">${icon('refresh', 'sm')} Sinkronkan</button>`)}
    <div class="status-summary">${statusMini('Baru terkirim', counts.Terkirim, 'blue')}${statusMini('Sedang ditinjau', counts.Diterima, 'orange')}${statusMini('Disetujui', counts.Disetujui, '')}${statusMini('Ditolak', counts.Ditolak, 'red')}</div>
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search', 'sm')}</span><input id="incoming-search" value="${esc(state.incomingSearch || '')}" placeholder="Cari nomor, warga, atau desa..."></div><div style="width:150px">${comboboxHtml({ name: 'incoming-filter', id: 'incoming-filter', readOnly: true, size: 'combobox-sm', selectedValue: state.letterFilter, options: ['Semua', 'Terkirim', 'Diterima', 'Disetujui', 'Ditolak'].map(s => ({ value: s, label: s })) })}</div><div style="width:190px">${comboboxHtml({ name: 'village-filter', id: 'village-filter', selectedValue: state.villageFilter, options: state.villages.map(v => ({ value: v.name, label: v.name })), placeholder: 'Semua desa', size: 'combobox-sm' })}</div><div class="toolbar-spacer"></div><button class="btn btn-sm btn-outline" data-action="reset-filter" data-scope="incoming" ${hasFilter ? '' : 'disabled'}>${icon('x', 'sm')} Reset filter</button></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>Nomor / jenis</th><th>Asal desa</th><th>Nama warga</th><th>Dikirim</th><th>Status</th><th>Catatan terakhir</th><th></th></tr></thead><tbody>${pageItems.length ? pageItems.map(l => `<tr><td><span class="primary">${esc(l.number)}</span><span class="secondary">${esc(l.type)}</span></td><td><span class="primary">${esc(l.village)}</span></td><td><span class="primary">${esc(l.citizen)}</span><span class="secondary">${esc(l.nik)}</span></td><td>${esc(l.date)}</td><td>${statusBadge(l.status)}</td><td><div class="reason"><span>${esc(l.reason)}</span></div></td><td><button class="btn btn-sm ${['Terkirim', 'Diterima'].includes(l.status) ? 'btn-secondary' : 'btn-outline'}" data-action="review-letter" data-id="${l.id}">${icon('eye', 'sm')} Tinjau</button></td></tr>`).join('') : `<tr><td colspan="7" class="empty-row">Tidak ada surat yang cocok dengan filter ini.</td></tr>`}</tbody></table>${paginationHtml('incoming', page, totalPages, `Menampilkan ${pageItems.length} dari ${state.incoming.length} surat`)}</div>`;
}

function renderVillages() {
  const q = (state.villageSearch || '').toLowerCase();
  const filtered = state.villages.filter(v =>
    (!q || v.name.toLowerCase().includes(q)) &&
    (!state.villageStatusFilter || v.status === state.villageStatusFilter)
  );
  const { pageItems, page, totalPages } = paginate(filtered, 'villages', 8);
  return `${pageHeader('Daftar Desa', 'Pantau aktivitas, jumlah penduduk, dan surat masuk dari setiap desa.', `<button class="btn btn-primary" data-action="add-account">${icon('user-plus', 'sm')} Tambah akun desa</button>`)}
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search', 'sm')}</span><input id="village-search" value="${esc(state.villageSearch || '')}" placeholder="Cari nama desa..."></div><div style="width:150px">${comboboxHtml({ name: 'village-status-filter', id: 'village-status-filter', readOnly: true, size: 'combobox-sm', selectedValue: state.villageStatusFilter, options: [{ value: '', label: 'Semua status' }, { value: 'Aktif', label: 'Aktif' }, { value: 'Nonaktif', label: 'Nonaktif' }] })}</div><div class="toolbar-spacer"></div><span class="small-note">${icon('users', 'sm')} ${state.villages.reduce((a, v) => a + v.residents, 0).toLocaleString('id-ID')} warga terpantau · Kec. Polongbangkeng Timur</span></div>
    <div class="village-grid" id="village-grid">${pageItems.length ? pageItems.map((v, i) => `<article class="village-card" style="animation-delay:${Math.min(i * 45, 360)}ms"><div class="village-head"><span class="village-avatar color-${LETTER_TYPES[i % 7].color}">${icon('village', 'lg')}${v.incoming ? `<i class="incoming-count">${v.incoming}</i>` : ''}</span><div><h3>${esc(v.name)}</h3><p>${esc(v.district)}</p></div><div class="village-head-actions"><button class="icon-btn" title="Edit desa" data-action="edit-village" data-village="${v.name}">${icon('edit', 'sm')}</button><button class="icon-btn" data-action="view-village" data-village="${v.name}">${icon('more', 'sm')}</button></div></div><div class="village-stats"><div class="village-stat"><strong>${v.residents.toLocaleString('id-ID')}</strong><span>Warga terdata</span></div><div class="village-stat"><strong>${v.incoming}</strong><span>Surat masuk</span></div></div><div class="village-foot"><span class="${v.status === 'Aktif' ? 'online' : 'offline'}">${v.status}</span><span>${esc(v.active)}</span><button class="see-all" data-action="view-village" data-village="${v.name}">Pantau ${icon('chevron-right', 'sm')}</button></div></article>`).join('') : `<div class="empty-row">Tidak ada desa yang cocok dengan filter ini.</div>`}</div>
    ${paginationHtml('villages', page, totalPages, `Menampilkan ${pageItems.length} dari ${filtered.length} desa`)}`;
}

function renderAccounts() {
  const q = (state.accountSearch || '').toLowerCase();
  const filtered = state.accounts.filter(a =>
    (!q || `${a.name} ${a.admin} ${a.user}`.toLowerCase().includes(q)) &&
    (!state.accountStatusFilter || a.status === state.accountStatusFilter)
  );
  return `${pageHeader('Akun Desa', 'Buat dan kelola akses desa ke sistem persuratan kecamatan.', `<button class="btn btn-primary" data-action="add-account">${icon('user-plus', 'sm')} Tambah akun desa</button>`)}
    <div class="small-note mb-14">${icon('shield', 'sm')} Hanya akun kecamatan yang dapat membuat akun desa. Setiap desa memiliki username unik dan dapat mengganti sandi setelah login pertama.</div>
    <div class="toolbar"><div class="toolbar-search"><span>${icon('search', 'sm')}</span><input id="account-search" value="${esc(state.accountSearch || '')}" placeholder="Cari akun atau desa..."></div><div style="width:150px">${comboboxHtml({ name: 'account-status-filter', id: 'account-status-filter', readOnly: true, size: 'combobox-sm', selectedValue: state.accountStatusFilter, options: [{ value: '', label: 'Semua status' }, { value: 'Aktif', label: 'Aktif' }, { value: 'Nonaktif', label: 'Nonaktif' }] })}</div><div class="toolbar-spacer"></div><button class="btn btn-sm btn-outline" data-action="export" data-export="accounts">${icon('download', 'sm')} Ekspor akun</button></div>
    <div class="table-card"><table class="data-table"><thead><tr><th>Desa</th><th>Admin desa</th><th>Username</th><th>Kontak</th><th>Dibuat</th><th>Status</th><th></th></tr></thead><tbody>${filtered.length ? filtered.map((a) => { const i = state.accounts.indexOf(a); return `<tr><td><div class="table-user"><span class="village-avatar" style="width:32px;height:32px;border-radius:9px">${icon('village', 'sm')}</span><span><span class="primary">${esc(a.name)}</span><span class="secondary">${esc(a.district)}</span></span></div></td><td>${esc(a.admin)}</td><td><span class="primary">${esc(a.user)}</span><span class="secondary">Sandi terenkripsi</span></td><td>${esc(a.phone)}</td><td>${esc(a.created)}</td><td><span class="badge ${a.status === 'Aktif' ? 'approved' : 'rejected'}">${esc(a.status)}</span></td><td><div class="table-actions"><button class="icon-btn" data-action="copy-account" data-index="${i}" title="Salin kredensial">${icon('copy', 'sm')}</button><button class="icon-btn" data-action="edit-account" data-index="${i}">${icon('edit', 'sm')}</button><button class="icon-btn" data-action="account-menu" data-index="${i}" title="Kelola akun">${icon('more', 'sm')}</button></div></td></tr>`; }).join('') : `<tr><td colspan="7" class="empty-row">Tidak ada akun yang cocok dengan filter ini.</td></tr>`}</tbody></table><div class="pagination"><span>${filtered.length} dari ${state.accounts.length} akun desa</span></div></div>`;
}

function openModal(inner, size = '') { $('#modal-root').innerHTML = `<div class="modal-backdrop" data-action="backdrop"><section class="modal ${size}">${inner}</section></div>`; }
function closeModal() { $('#modal-root').innerHTML = ''; }
function modalHead(title, subtitle, ic = 'file') { return `<div class="modal-head"><span class="modal-title-icon">${icon(ic)}</span><div><h2>${title}</h2><p>${subtitle}</p></div><button class="icon-btn" data-action="close-modal">${icon('x', 'sm')}</button></div>`; }

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

function openNewLetter(type = '') {
  const selected = type || LETTER_TYPES[0].name;
  openModal(`<form id="new-letter-form">${modalHead('Buat usulan surat', 'Isi data, pratinjau, lalu kirim ke kecamatan.', 'mail')}<div class="modal-body"><div class="form-grid">
    <div class="field span-2"><label class="form-label">Jenis surat</label>${comboboxHtml({ name: 'type', required: true, readOnly: true, selectedValue: selected, options: LETTER_TYPES.map(t => ({ value: t.name, label: t.name })) })}</div>
    <div class="field span-2"><label class="form-label">Warga pemohon</label>${comboboxHtml({ name: 'resident', options: state.residents.map(r => ({ value: r.nik, label: r.name, sub: r.nik })), placeholder: 'Cari nama atau NIK warga...', required: true })}<span class="helper">Data identitas akan terisi otomatis dari data warga.</span></div>
    <div class="field"><label class="form-label">Nomor surat</label><input name="number" value="140/${String(state.letters.length + 32).padStart(3, '0')}/DB/VIII/2026" required></div>
    <div class="field"><label class="form-label">Tanggal surat</label><input name="date" type="date" value="${new Date().toISOString().slice(0, 10)}" required></div>
    <div class="field span-2"><label class="form-label">Ditujukan kepada</label><input name="destination" value="Camat Polongbangkeng Timur, Kabupaten Takalar" required></div>
    <div class="field span-2"><label class="form-label">Keperluan / perihal</label><textarea name="purpose" placeholder="Jelaskan keperluan pengajuan surat..." required></textarea></div>
    <div class="field span-2"><label class="form-label">Catatan tambahan <span class="muted">(opsional)</span></label><textarea name="note" placeholder="Catatan untuk petugas kecamatan" style="min-height:65px"></textarea></div>
    <div class="small-note span-2">${icon('info', 'sm')} Surat akan dibuat menggunakan template aktif dan langsung dikirim ke antrean Kecamatan Polongbangkeng Timur.</div>
  </div></div><div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Batal</button><button type="button" class="btn btn-secondary" data-action="preview-new-letter">${icon('eye', 'sm')} Pratinjau</button><button type="submit" class="btn btn-primary">${icon('send', 'sm')} Simpan & kirim</button></div></form>`, 'modal-lg');
}

function openAddResident(existing = null) {
  openModal(`<form id="resident-form">${modalHead(existing ? 'Edit data warga' : 'Tambah data warga', existing ? 'Perbarui informasi penduduk.' : `Input data penduduk ${state.currentVillage}.`, 'user-plus')}<div class="modal-body"><div class="form-grid">
    <div class="field"><label class="form-label">NIK</label><input name="nik" maxlength="16" value="${esc(existing?.nik || '')}" placeholder="16 digit NIK" ${existing ? 'readonly' : ''} required></div>
    <div class="field"><label class="form-label">Nama lengkap</label><input name="name" value="${esc(existing?.name || '')}" placeholder="Sesuai KTP" required></div>
    <div class="field"><label class="form-label">Jenis kelamin</label>${comboboxHtml({ name: 'gender', readOnly: true, selectedValue: existing?.gender || 'Laki-laki', options: [{ value: 'Laki-laki', label: 'Laki-laki' }, { value: 'Perempuan', label: 'Perempuan' }] })}</div>
    <div class="field"><label class="form-label">Tempat, tanggal lahir</label><input name="birth" value="${esc(existing?.birth || '')}" placeholder="Takalar, 13 Agustus 1990" required></div>
    <div class="field span-2"><label class="form-label">Alamat lengkap</label><textarea name="address" style="min-height:70px" placeholder="Dusun, RT/RW..." required>${esc(existing?.address || '')}</textarea></div>
    <div class="field"><label class="form-label">Status dalam keluarga</label>${comboboxHtml({ name: 'family', readOnly: true, selectedValue: existing?.status || 'Kepala Keluarga', options: [{ value: 'Kepala Keluarga', label: 'Kepala Keluarga' }, { value: 'Istri', label: 'Istri' }, { value: 'Anak', label: 'Anak' }, { value: 'Lainnya', label: 'Lainnya' }] })}</div>
    <div class="field"><label class="form-label">Nomor KK</label><input name="kk" maxlength="16" placeholder="16 digit nomor KK"></div>
  </div></div><div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Batal</button><button type="submit" class="btn btn-primary">${icon('check', 'sm')} ${existing ? 'Simpan perubahan' : 'Simpan data warga'}</button></div></form>`);
}

function openResidentDetail(resident) {
  openModal(`${modalHead('Detail warga', `Data penduduk ${state.currentVillage}.`, 'user')}<div class="modal-body"><div class="detail-list"><div class="detail-row"><span>NIK</span><strong>${esc(resident.nik)}</strong></div><div class="detail-row"><span>Nama lengkap</span><strong>${esc(resident.name)}</strong></div><div class="detail-row"><span>Jenis kelamin</span><strong>${esc(resident.gender)}</strong></div><div class="detail-row"><span>Tempat/Tgl lahir</span><strong>${esc(resident.birth)}</strong></div><div class="detail-row"><span>Alamat</span><strong>${esc(resident.address)}</strong></div><div class="detail-row"><span>Status keluarga</span><strong>${esc(resident.status)}</strong></div></div></div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button><button class="btn btn-primary" data-action="new-letter">${icon('mail', 'sm')} Buat surat</button></div>`);
}

function openConfirmDeleteResident(resident) {
  openModal(`${modalHead('Hapus data warga', 'Tindakan ini tidak dapat dibatalkan.', 'x')}<div class="modal-body"><p>Yakin ingin menghapus data warga <strong>${esc(resident.name)}</strong> (NIK ${esc(resident.nik)}) dari data penduduk ${esc(state.currentVillage)}?</p></div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Batal</button><button class="btn btn-danger" data-action="confirm-delete-resident" data-nik="${resident.nik}">${icon('x', 'sm')} Ya, hapus</button></div>`);
}

async function documentPaper(letter, opts = {}) {
  return await renderDocumentBodyHtml(letter, opts);
}

async function openLetterView(letter) {
  const paper = await documentPaper(letter);
  openModal(`${modalHead('Detail surat', `${letter.number} · ${letter.type}`, 'file')}<div class="modal-body"><div class="review-grid"><div class="document-preview">${paper}</div><div class="review-info"><h3>Informasi pengajuan</h3><div class="detail-list"><div class="detail-row"><span>ID surat</span><strong>${esc(letter.id)}</strong></div><div class="detail-row"><span>Nama warga</span><strong>${esc(letter.citizen)}</strong></div><div class="detail-row"><span>NIK</span><strong>${esc(letter.nik)}</strong></div><div class="detail-row"><span>Dikirim</span><strong>${esc(letter.updated)}</strong></div><div class="detail-row"><span>Status</span><strong>${statusBadge(letter.status)}</strong></div><div class="detail-row"><span>Catatan/alasan</span><strong>${esc(letter.reason)}</strong></div></div><div class="decision-box"><h4>Alur berikutnya</h4><p>${letter.status === 'Disetujui' ? 'Surat sudah dicetak di kecamatan. Warga dapat mengambil dan menandatangani dokumen di loket.' : letter.status === 'Ditolak' ? 'Perbaiki kekurangan sesuai alasan penolakan, lalu ajukan kembali.' : 'Surat sedang dalam alur pemeriksaan Kecamatan Polongbangkeng Timur.'}</p></div></div></div></div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button><button class="btn btn-secondary" data-action="download-letter-docx" data-id="${letter.id}">${icon('download', 'sm')} Unduh Word</button><button class="btn btn-secondary" data-action="print-letter" data-id="${letter.id}">${icon('printer', 'sm')} Cetak pratinjau</button></div>`, 'modal-xl');
}

async function openReview(letter) {
  const actionable = ['Terkirim', 'Diterima'].includes(letter.status);
  const paper = await documentPaper(letter);
  openModal(`<form id="decision-form" data-id="${letter.id}">${modalHead('Tinjau surat masuk', `${letter.village} · Dikirim ${letter.date}`, 'eye')}<div class="modal-body"><div class="review-grid"><div class="document-preview">${paper}</div><div class="review-info"><h3>Informasi pengajuan</h3><div class="detail-list"><div class="detail-row"><span>Nomor</span><strong>${esc(letter.number)}</strong></div><div class="detail-row"><span>Jenis surat</span><strong>${esc(letter.type)}</strong></div><div class="detail-row"><span>Asal desa</span><strong>${esc(letter.village)}</strong></div><div class="detail-row"><span>Nama warga</span><strong>${esc(letter.citizen)}</strong></div><div class="detail-row"><span>NIK</span><strong>${esc(letter.nik)}</strong></div><div class="detail-row"><span>Keperluan</span><strong>${esc(letter.purpose)}</strong></div><div class="detail-row"><span>Status</span><strong>${statusBadge(letter.status)}</strong></div></div>
    <div class="decision-box"><h4>Keputusan & alasan</h4><p>Setiap perubahan status wajib disertai alasan atau catatan untuk pihak desa.</p><div class="field" style="margin:0"><textarea name="reason" placeholder="Tulis hasil pemeriksaan atau alasan keputusan..." ${actionable ? 'required' : ''}>${actionable ? '' : esc(letter.reason)}</textarea></div></div></div></div></div>
    <div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Tutup</button><button type="button" class="btn btn-secondary" data-action="download-letter-docx" data-id="${letter.id}">${icon('download', 'sm')} Unduh Word</button>${actionable ? `<button type="submit" name="decision" value="Ditolak" class="btn btn-danger-soft">${icon('x', 'sm')} Tolak</button>${letter.status === 'Terkirim' ? `<button type="submit" name="decision" value="Diterima" class="btn btn-secondary">${icon('mail', 'sm')} Terima berkas</button>` : ''}<button type="submit" name="decision" value="Disetujui" class="btn btn-primary">${icon('check', 'sm')} Setujui</button>` : `<button type="button" class="btn btn-secondary" data-action="print-letter" data-id="${letter.id}">${icon('printer', 'sm')} Cetak surat</button>`}</div></form>`, 'modal-xl');
}

function openTemplateEditor(type) {
  const t = state.templates[type] || { content: defaultTemplate(type, state.currentVillage) };
  openModal(`<form id="template-form" data-type="${type}">${modalHead(`Edit ${type}`, 'Perubahan tersimpan sebagai template dan dapat dipakai berulang.', 'template')}<div class="modal-body"><label class="form-label">Isi template surat</label><div class="editor-toolbar"><button type="button" class="tool-btn" data-editor="bold">B</button><button type="button" class="tool-btn" data-editor="italic"><i>I</i></button><button type="button" class="tool-btn" data-editor="underline"><u>U</u></button><i class="tool-divider"></i><button type="button" class="tool-btn" data-insert="{{nama_warga}}">+ Nama</button><button type="button" class="tool-btn" data-insert="{{nik}}">+ NIK</button><button type="button" class="tool-btn" data-insert="{{alamat}}">+ Alamat</button><button type="button" class="tool-btn" data-insert="{{keperluan}}">+ Keperluan</button></div><textarea class="template-editor" name="content" id="template-editor">${esc(t.content)}</textarea><span class="helper">Variabel dalam tanda {{...}} akan diisi otomatis saat surat dibuat.</span></div><div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Batal</button><button type="button" class="btn btn-secondary" data-action="preview-template">${icon('eye', 'sm')} Pratinjau</button><button type="submit" class="btn btn-primary">${icon('check', 'sm')} Simpan template</button></div></form>`, 'modal-lg');
}

function openAddAccount(existing = null, index = '') {
  openModal(`<form id="account-form" data-index="${index}">${modalHead(existing ? 'Edit akun desa' : 'Buat akun desa', existing ? 'Perbarui data desa. Login dikelola lewat Supabase Auth.' : 'Akun login baru langsung dibuat otomatis.', 'user-plus')}<div class="modal-body"><div class="form-grid">
    <div class="field span-2"><label class="form-label">Nama desa</label><input name="name" value="${esc(existing?.name || '')}" placeholder="Contoh: Desa Pattinoang" required></div>
    <div class="field"><label class="form-label">Kecamatan</label>${comboboxHtml({ name: 'district', readOnly: true, options: [{ value: 'Kec. Polongbangkeng Timur', label: 'Kec. Polongbangkeng Timur' }] })}</div>
    <div class="field"><label class="form-label">Nama admin desa</label><input name="admin" value="${esc(existing?.admin || '')}" placeholder="Nama staf penanggung jawab" required></div>
    <div class="field"><label class="form-label">Nomor WhatsApp</label><input name="phone" value="${esc(existing?.phone || '')}" placeholder="08xx xxxx xxxx" required></div>
    ${existing ? '' : `<div class="field"><label class="form-label">Username</label><input name="username" placeholder="Username unik, tanpa spasi" required></div>
    <div class="field"><label class="form-label">Kata sandi awal</label><input name="password" value="Takalar@2026" required minlength="6"></div>`}
    <div class="small-note span-2">${icon('shield', 'sm')} ${existing ? 'Username & kata sandi login dikelola lewat Supabase Auth dan tidak diedit di sini.' : 'Akun login dibuat otomatis begitu disimpan. Sampaikan username & kata sandi ini ke admin desa untuk login pertama.'}</div>
  </div></div><div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Batal</button><button type="submit" class="btn btn-primary">${icon('check', 'sm')} ${existing ? 'Simpan perubahan' : 'Buat akun desa'}</button></div></form>`);
}

function openVillageDetail(village) {
  const letters = state.incoming.filter(l => l.village === village.name);
  openModal(`${modalHead(village.name, `${village.district} · Pantauan akun desa`, 'village')}<div class="modal-body"><div class="stats-grid" style="grid-template-columns:1fr 1fr"><div class="stat-card"><div class="stat-top"><span class="stat-icon">${icon('users')}</span></div><div class="value">${village.residents.toLocaleString('id-ID')}</div><div class="label">Warga terdata</div></div><div class="stat-card"><div class="stat-top"><span class="stat-icon orange">${icon('mail')}</span></div><div class="value">${village.incoming}</div><div class="label">Surat masuk bulan ini</div></div></div><div class="detail-list mb-14"><div class="detail-row"><span>Admin desa</span><strong>${esc(village.admin)}</strong></div><div class="detail-row"><span>Username</span><strong>${esc(village.user)}</strong></div><div class="detail-row"><span>Kontak</span><strong>${esc(village.phone)}</strong></div><div class="detail-row"><span>Aktivitas</span><strong class="text-brand">Aktif ${esc(village.active)}</strong></div></div><h3 class="section-title">Surat terbaru dari desa</h3>${letters.length ? recentTable(letters.slice(0, 4), true) : `<div class="small-note">Belum ada surat pada data demo.</div>`}</div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button><button class="btn btn-outline" data-action="edit-village" data-village="${village.name}">${icon('edit', 'sm')} Edit desa</button><button class="btn btn-primary" data-action="go-village-incoming" data-village="${village.name}">${icon('mail', 'sm')} Lihat surat masuk</button></div>`, 'modal-lg');
}

function findLetter(id) { return [...state.incoming, ...state.letters].find(l => l.id === id); }
function findAccountIndexByVillage(name) { return state.accounts.findIndex(a => a.name === name); }

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
    if (!q || !state.role) { panel.hidden = true; panel.innerHTML = ''; return; }
    const results = [];
    const letterPool = state.role === 'camat' ? state.incoming : state.letters;
    letterPool.forEach(l => { if (`${l.number} ${l.type} ${l.citizen} ${l.village || ''}`.toLowerCase().includes(q)) results.push({ kind: 'letter', id: l.id, title: l.number, sub: `${l.type} · ${l.citizen}` }); });
    if (state.role === 'desa') state.residents.forEach(r => { if (`${r.name} ${r.nik}`.toLowerCase().includes(q)) results.push({ kind: 'resident', id: r.nik, title: r.name, sub: r.nik }); });
    else state.villages.forEach(v => { if (v.name.toLowerCase().includes(q)) results.push({ kind: 'village', id: v.name, title: v.name, sub: v.district }); });
    const top = results.slice(0, 6);
    panel.innerHTML = top.length ? top.map(r => `<button type="button" class="search-result-item" data-kind="${r.kind}" data-rid="${esc(r.id)}">${icon(r.kind === 'letter' ? 'mail' : r.kind === 'resident' ? 'user' : 'village', 'sm')}<span><strong>${esc(r.title)}</strong><span>${esc(r.sub)}</span></span></button>`).join('') : `<div class="search-empty">Tidak ada hasil untuk "${esc(qRaw)}"</div>`;
    panel.hidden = false;
  }
  input.addEventListener('input', () => run(input.value));
  input.addEventListener('focus', () => { if (input.value.trim()) run(input.value); });
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) panel.hidden = true; });
  panel.addEventListener('click', e => {
    const item = e.target.closest('.search-result-item'); if (!item) return;
    const { kind, rid } = item.dataset; panel.hidden = true; input.value = '';
    if (kind === 'letter') { const l = findLetter(rid); if (l) { state.page = state.role === 'camat' ? 'incoming' : 'status'; renderApp(); state.role === 'camat' ? openReview(l) : openLetterView(l); } }
    else if (kind === 'resident') { const r = state.residents.find(x => x.nik === rid); if (r) { state.page = 'residents'; renderApp(); openResidentDetail(r); } }
    else if (kind === 'village') { const v = state.villages.find(x => x.name === rid); if (v) { state.page = 'villages'; renderApp(); openVillageDetail(v); } }
  }); // openReview/openLetterView bersifat async (nunggu render pratinjau docx); tidak perlu di-await di sini karena listener klik ini cuma memicu pembukaan modal, bukan menunggu hasilnya.
}

async function openPreviewOverlay(letter, opts = {}) {
  const el = document.createElement('div');
  el.className = 'modal-backdrop preview-overlay';
  el.innerHTML = `<section class="modal modal-lg"><div class="modal-head"><span class="modal-title-icon">${icon('eye')}</span><div><h2>Pratinjau surat</h2><p>Tampilan dokumen sesuai template aktif saat ini.</p></div><button class="icon-btn" data-close-preview="1">${icon('x', 'sm')}</button></div><div class="modal-body"><div class="doc-preview-loading"><span class="btn-spinner"></span> Memuat pratinjau dari file Word...</div></div></section>`;
  document.body.appendChild(el);
  const paper = await documentPaper(letter, opts);
  const body = el.querySelector('.modal-body');
  if (body) body.innerHTML = paper;
}
async function printLetter(letter) {
  const win = window.open('', '_blank', 'width=480,height=700');
  if (!win) { window.print(); return; }
  const paper = await documentPaper(letter);
  win.document.write(`<!DOCTYPE html><html><head><title>${esc(letter.number)}</title><link rel="stylesheet" href="assets/css/styles.css"></head><body style="padding:24px;background:#fff"><script>window.onload=()=>{window.print();}<\/script>${paper}</body></html>`);
  win.document.close();
}
function accountMenuModal(index) {
  const a = state.accounts[index];
  return `${modalHead('Kelola akun desa', a.name, 'user')}<div class="modal-body"><div class="detail-list mb-14"><div class="detail-row"><span>Admin desa</span><strong>${esc(a.admin)}</strong></div><div class="detail-row"><span>Kontak</span><strong>${esc(a.phone)}</strong></div><div class="detail-row"><span>Status</span><strong>${esc(a.status)}</strong></div></div><div class="quick-actions">
    <button class="quick-action" data-action="account-toggle-status" data-index="${index}"><span class="stat-icon ${a.status === 'Aktif' ? 'orange' : ''}">${icon(a.status === 'Aktif' ? 'x' : 'check', 'sm')}</span><span><strong>${a.status === 'Aktif' ? 'Nonaktifkan akun' : 'Aktifkan akun'}</strong><span>${a.status === 'Aktif' ? 'Desa tidak bisa login sementara' : 'Desa dapat login kembali'}</span></span></button>
    <button class="quick-action" data-action="account-delete" data-index="${index}"><span class="stat-icon" style="color:#B8483C">${icon('x', 'sm')}</span><span><strong>Hapus akun</strong><span>Tindakan tidak dapat dibatalkan</span></span></button>
  </div></div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button></div>`;
}
function notificationsModal() {
  const pool = state.role === 'camat' ? state.incoming : state.letters;
  const items = pool.slice(0, 6);
  return `${modalHead('Notifikasi', 'Pembaruan surat terbaru.', 'bell')}<div class="modal-body">${items.length ? `<div class="activity-list">${items.map(l => `<button type="button" class="activity-item popover-btn" data-action="${state.role === 'camat' ? 'review-letter' : 'view-letter'}" data-id="${l.id}"><span class="activity-icon">${icon('mail', 'sm')}</span><div class="activity-copy"><strong>${esc(l.number)} · ${esc(l.type)}</strong><p>${esc(l.citizen)} — ${statusBadge(l.status)}</p><time>${esc(l.updated)}</time></div></button>`).join('')}</div>` : `<div class="small-note">Belum ada notifikasi.</div>`}</div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button></div>`;
}
function helpModal() {
  return `${modalHead('Pusat bantuan', 'Hubungi tim dukungan Kecamatan Polongbangkeng Timur.', 'info')}<div class="modal-body"><div class="detail-list mb-14"><div class="detail-row"><span>Telepon</span><strong>(0418) 21001</strong></div><div class="detail-row"><span>Jam layanan</span><strong>Senin–Jumat, 08.00–16.00 WITA</strong></div></div><a class="btn btn-primary btn-block" href="https://wa.me/6281234421001" target="_blank" rel="noopener">${icon('send', 'sm')} Hubungi via WhatsApp</a></div><div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button></div>`;
}
// Dulu cuma toast singkat — sekarang jadi modal supaya staf desa yang kurang
// familiar dengan istilah "variabel" tetap bisa ikuti langkah-langkahnya
// pelan-pelan, plus tabel lengkap arti tiap {{...}} yang bisa dipakai.
function templateGuideModal() {
  const vars = [
    ['nama_warga', 'Nama lengkap warga yang mengajukan surat'],
    ['nik', 'NIK (16 digit) warga pemohon'],
    ['alamat', 'Alamat warga, diambil dari data di menu Data Warga'],
    ['tempat_tanggal_lahir', 'Tempat dan tanggal lahir warga'],
    ['keperluan', 'Keperluan surat yang diketik saat membuat surat'],
    ['tanggal', 'Tanggal surat dibuat'],
    ['nomor_surat', 'Nomor urut surat'],
    ['jenis_surat', 'Nama jenis surat, misalnya "Surat Keterangan Domisili"'],
    ['nama_desa', 'Nama desa yang mengeluarkan surat'],
  ];
  return `${modalHead('Panduan variabel template Word', 'Langkah lengkap supaya template Word terisi otomatis.', 'info')}
    <div class="modal-body">
      <ol class="guide-steps">
        <li><b>Unduh dulu</b> file Word-nya lewat tombol <b>Unduh Word</b> pada jenis surat yang mau diedit.</li>
        <li>Buka file itu di <b>Microsoft Word</b> atau <b>WPS Office</b> di komputer/HP.</li>
        <li>Ubah bebas: logo, kop surat, tata letak, ukuran huruf, kalimat — apa saja boleh diganti.</li>
        <li>Yang <b>tidak boleh</b> diubah atau dihapus adalah tulisan di dalam tanda kurung kurawal ganda, contoh <code>{{nama_warga}}</code>. Bagian ini yang nanti otomatis diisi sistem.</li>
        <li>Simpan file (tetap dalam format <code>.docx</code>, jangan diubah jadi PDF), lalu unggah kembali lewat tombol <b>Unggah Word</b>.</li>
      </ol>
      <h3 class="section-title">Daftar variabel yang bisa dipakai</h3>
      <div class="detail-list">${vars.map(([v, desc]) => `<div class="detail-row"><span class="tpl-var-tag">{{${v}}}</span><strong>${esc(desc)}</strong></div>`).join('')}</div>
      <div class="small-note" style="margin-top:12px">${icon('info', 'sm')} Ketik variabel persis seperti di atas: huruf kecil semua, dua kurung kurawal di depan dan belakang, tanpa spasi tambahan di dalamnya. Salah ketik (mis. <code>{{Nama_Warga}}</code> atau <code>{ nama_warga }}</code>) membuat bagian itu tidak akan terisi.</div>
    </div>
    <div class="modal-foot"><button class="btn btn-primary" data-action="close-modal">${icon('check', 'sm')} Mengerti</button></div>`;
}
function profileModal() {
  return `<form id="password-form">${modalHead('Profil & keamanan', state.role === 'camat' ? 'Admin Kecamatan Polongbangkeng Timur' : (state.currentVillage || 'Desa'), 'user')}<div class="modal-body"><div class="detail-list mb-14"><div class="detail-row"><span>Peran</span><strong>${state.role === 'camat' ? 'Camat / Admin Kecamatan' : 'Admin Desa'}</strong></div><div class="detail-row"><span>Nama</span><strong>${esc(state.profileName || '-')}</strong></div></div><label class="form-label">Ganti kata sandi</label><div class="field has-icon"><span class="prefix">${icon('lock', 'sm')}</span><input name="password" type="password" placeholder="Kata sandi baru (min. 6 karakter)" minlength="6" required></div></div><div class="modal-foot"><button type="button" class="btn btn-outline" data-action="logout">${icon('logout', 'sm')} Keluar</button><button type="submit" class="btn btn-primary">${icon('check', 'sm')} Simpan sandi baru</button></div></form>`;
}
function openEditVillage(name) {
  const idx = findAccountIndexByVillage(name);
  if (idx === -1) { toast('Data akun tidak ditemukan', 'Desa ini belum memiliki akun terdaftar.', 'error'); return; }
  openAddAccount(state.accounts[idx], idx);
}

// Global interactions
document.addEventListener('click', async e => {
  const closePreview = e.target.closest('[data-close-preview]');
  if (closePreview) { closePreview.closest('.preview-overlay')?.remove(); return; }
  if (e.target.classList?.contains('preview-overlay')) { e.target.remove(); return; }
  const el = e.target.closest('[data-action],[data-page],[data-editor],[data-insert]'); if (!el) return;
  if (el.dataset.page) { state.page = el.dataset.page; state.mobileOpen = false; renderApp(); return; }
  const action = el.dataset.action;
  if (action === 'toggle-password') { const p = $('#login-password'); p.type = p.type === 'password' ? 'text' : 'password'; }
  else if (action === 'forgot') toast('Hubungi administrator', 'Kecamatan dapat mereset kata sandi akun desa.');
  else if (action === 'logout') { closeModal(); doLogout(); }
  else if (action === 'open-mobile') { state.mobileOpen = true; renderApp(); }
  else if (action === 'close-mobile') { state.mobileOpen = false; renderApp(); }
  else if (action === 'close-modal') { closeModal(); }
  else if (action === 'backdrop' && e.target === el) { closeModal(); }
  else if (action === 'new-letter') { closeModal(); openNewLetter(el.dataset.type || ''); }
  else if (action === 'add-resident') { openAddResident(); }
  else if (action === 'edit-resident') { openAddResident(state.residents.find(r => r.nik === el.dataset.nik)); }
  else if (action === 'view-resident') { openResidentDetail(state.residents.find(r => r.nik === el.dataset.nik)); }
  else if (action === 'delete-resident') { openConfirmDeleteResident(state.residents.find(r => r.nik === el.dataset.nik)); }
  else if (action === 'confirm-delete-resident') {
    setBtnLoading(el, 'Menghapus...');
    const nik = el.dataset.nik;
    const resident = state.residents.find(r => r.nik === nik);
    const { error } = await sb.from('residents').delete().eq('nik', nik).eq('village_id', state.currentVillageId);
    clearBtnLoading(el);
    if (error) { toast('Gagal menghapus data warga', error.message, 'error'); return; }
    await loadResidents();
    closeModal(); if (state.page === 'residents') renderApp();
    toast('Data warga dihapus', `${resident?.name || 'Data'} telah dihapus dari data penduduk desa.`);
  }
  else if (action === 'view-letter') { closeModal(); await openLetterView(findLetter(el.dataset.id)); }
  else if (action === 'review-letter') { closeModal(); await openReview(findLetter(el.dataset.id)); }
  else if (action === 'edit-template') { openTemplateEditor(el.dataset.type); }
  else if (action === 'download-template') { setBtnLoading(el, 'Menyiapkan...'); await downloadTemplateForEditing(el.dataset.type); clearBtnLoading(el); }
  else if (action === 'download-letter-docx') { setBtnLoading(el, 'Menyiapkan...'); await downloadLetterDocx(findLetter(el.dataset.id)); clearBtnLoading(el); }
  else if (action === 'add-account') { openAddAccount(); }
  else if (action === 'edit-account') { openAddAccount(state.accounts[+el.dataset.index], el.dataset.index); }
  else if (action === 'view-village') { openVillageDetail(state.villages.find(v => v.name === el.dataset.village)); }
  else if (action === 'edit-village') { openEditVillage(el.dataset.village); }
  else if (action === 'go-village-incoming') { closeModal(); state.page = 'incoming'; renderApp(); }
  else if (action === 'copy-account') { const a = state.accounts[+el.dataset.index]; if (navigator.clipboard) navigator.clipboard.writeText(`Desa: ${a.name}\nAdmin: ${a.admin}\nKontak: ${a.phone}`); toast('Info disalin', `Detail akun ${a.name} disalin. Sandi login tidak dapat diambil ulang — reset lewat Supabase Auth bila lupa.`); }
  else if (action === 'account-menu') { openModal(accountMenuModal(+el.dataset.index)); }
  else if (action === 'account-toggle-status') {
    const idx = +el.dataset.index; const a = state.accounts[idx]; const newStatus = a.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    setBtnLoading(el, 'Memproses...');
    const { error } = await sb.from('villages').update({ status: newStatus }).eq('id', a.id);
    clearBtnLoading(el);
    if (error) { toast('Gagal memperbarui status', error.message, 'error'); return; }
    a.status = newStatus; const v = state.villages.find(v => v.id === a.id); if (v) v.status = newStatus;
    closeModal(); renderApp(); toast('Status akun diperbarui', `${a.name} kini berstatus ${a.status}.`);
  }
  else if (action === 'account-delete') {
    toast('Belum tersedia', 'Menghapus akun login perlu Edge Function (Supabase Admin API) yang belum aktif. Nonaktifkan akun untuk sementara.', 'error');
  }
  else if (action === 'notifications') { openModal(notificationsModal()); }
  else if (action === 'help') { openModal(helpModal()); }
  else if (action === 'profile-menu') { openModal(profileModal()); }
  else if (action === 'refresh') {
    setBtnLoading(el, 'Menyinkronkan...');
    await loadAllForRole();
    clearBtnLoading(el);
    renderApp(); toast('Data tersinkron', 'Daftar sudah menggunakan data terbaru dari Supabase.');
  }
  else if (action === 'export') { exportData(el.dataset.export || 'residents'); }
  else if (action === 'paginate') {
    const scope = el.dataset.scope; state.pagination = state.pagination || {};
    const cur = state.pagination[scope] || 1;
    if (el.dataset.num) state.pagination[scope] = +el.dataset.num;
    else if (el.dataset.dir === 'prev') state.pagination[scope] = Math.max(1, cur - 1);
    else if (el.dataset.dir === 'next') state.pagination[scope] = cur + 1;
    renderApp();
  }
  else if (action === 'reset-filter') {
    const scope = el.dataset.scope; state.pagination = state.pagination || {};
    if (scope === 'residents') { state.residentSearch = ''; state.residentDusun = ''; state.residentGender = ''; }
    if (scope === 'incoming') { state.incomingSearch = ''; state.letterFilter = 'Semua'; state.villageFilter = ''; }
    state.pagination[scope] = 1; renderApp();
  }
  else if (action === 'print-letter') { const l = findLetter(el.dataset.id); if (l) await printLetter(l); else window.print(); }
  else if (action === 'template-guide') openModal(templateGuideModal());
  else if (action === 'preview-new-letter') {
    const form = document.getElementById('new-letter-form'); if (!form) return;
    const fd = new FormData(form);
    const resident = state.residents.find(r => r.nik === fd.get('resident'));
    if (!resident || !fd.get('purpose')) { toast('Lengkapi data dulu', 'Pilih warga pemohon dan isi keperluan untuk melihat pratinjau.', 'error'); return; }
    await openPreviewOverlay({ number: fd.get('number'), type: fd.get('type'), citizen: resident.name, nik: resident.nik, village: state.currentVillage, purpose: fd.get('purpose'), date: fd.get('date') || formatDateID(new Date().toISOString()) });
  }
  else if (action === 'preview-template') {
    const form = document.getElementById('template-form'); const area = $('#template-editor'); if (!area || !form) return;
    const type = form.dataset.type; const backup = state.templates[type];
    state.templates[type] = { content: area.value, edited: backup?.edited };
    // forceManualText: true -> pratinjau ini memang harus nunjukin teks manual
    // yang lagi diketik di textarea, bukan file .docx (unggahan/bawaan).
    await openPreviewOverlay({ number: '140/000/DB/VIII/2026', type, citizen: 'Nama Warga Contoh', nik: '7305060000000000', village: state.currentVillage, purpose: 'contoh keperluan surat', date: formatDateID(new Date().toISOString()) }, { forceManualText: true });
    state.templates[type] = backup;
  }
  else if (el.dataset.editor) {
    const area = $('#template-editor'); if (!area) return;
    const marks = { bold: '**', italic: '*', underline: '__' }[el.dataset.editor];
    const start = area.selectionStart, end = area.selectionEnd; const selected = area.value.slice(start, end) || 'teks';
    area.value = area.value.slice(0, start) + marks + selected + marks + area.value.slice(end);
    area.focus(); area.selectionStart = start + marks.length; area.selectionEnd = start + marks.length + selected.length;
  }
  else if (action === 'insert-variable' || el.dataset.insert) {
    const area = $('#template-editor'); const text = el.dataset.insert; if (area) { const start = area.selectionStart; area.value = area.value.slice(0, start) + text + area.value.slice(area.selectionEnd); area.focus(); area.selectionStart = area.selectionEnd = start + text.length; }
  }
});

const SUBMIT_LOADING_LABELS = {
  'login-form': 'Memproses masuk...',
  'password-form': 'Menyimpan sandi...',
  'new-letter-form': 'Mengirim surat...',
  'resident-form': 'Menyimpan data...',
  'template-form': 'Menyimpan template...',
  'decision-form': 'Menyimpan keputusan...',
  'account-form': 'Menyimpan...'
};

document.addEventListener('submit', async e => {
  e.preventDefault(); const form = e.target; const fd = new FormData(form);
  const submitBtn = e.submitter || form.querySelector('button[type="submit"]');
  const isNewAccount = form.id === 'account-form' && form.dataset.index === '';
  setBtnLoading(submitBtn, isNewAccount ? 'Membuat akun...' : (SUBMIT_LOADING_LABELS[form.id] || 'Memproses...'));
  try {
  if (form.id === 'login-form') {
    const username = fd.get('username').trim(), password = fd.get('password');
    await doLogin(username, password);
  }
  if (form.id === 'password-form') {
    const password = fd.get('password');
    const { error } = await sb.auth.updateUser({ password });
    if (error) { toast('Gagal mengganti sandi', error.message, 'error'); return; }
    closeModal(); toast('Sandi diperbarui', 'Gunakan kata sandi baru pada login berikutnya.');
  }
  if (form.id === 'new-letter-form') {
    const resident = state.residents.find(r => r.nik === fd.get('resident'));
    if (!resident) { toast('Data belum lengkap', 'Silakan pilih warga pemohon.', 'error'); return; }
    const insertRow = {
      number: fd.get('number'), letter_type: fd.get('type'), village_id: state.currentVillageId,
      resident_nik: resident.nik, citizen_name: resident.name, purpose: fd.get('purpose'),
      status: 'Terkirim', reason: 'Menunggu pemeriksaan kelengkapan oleh petugas kecamatan.'
    };
    const { data: inserted, error } = await sb.from('letters').insert(insertRow).select().single();
    if (error) { toast('Gagal mengirim surat', error.message, 'error'); return; }
    await loadLettersDesa();
    closeModal(); state.page = 'status'; renderApp(); toast('Surat berhasil dikirim', `${insertRow.letter_type} untuk ${resident.name} masuk antrean kecamatan.`);
    // Buat file Word terisi otomatis dari template aktif, lalu langsung unduh.
    try {
      const blob = await generateLetterDocx(inserted.id, { type: insertRow.letter_type, number: insertRow.number, citizen: resident.name, nik: resident.nik, village: state.currentVillage, villageId: state.currentVillageId, purpose: insertRow.purpose, date: formatDateID(inserted.created_at) });
      downloadBlob(blob, `${insertRow.number} - ${resident.name}.docx`);
      await loadLettersDesa();
    } catch (err) { toast('Surat terkirim, dokumen Word belum siap', `${err.message} Coba unduh lagi dari halaman Status Surat.`, 'error'); }
  }
  if (form.id === 'resident-form') {
    const nik = fd.get('nik').trim(); const isEdit = state.residents.some(r => r.nik === nik);
    const data = { nik, village_id: state.currentVillageId, name: fd.get('name'), gender: fd.get('gender'), birth_place_date: fd.get('birth'), address: fd.get('address'), family_status: fd.get('family') };
    const { error } = await sb.from('residents').upsert(data);
    if (error) { toast('Gagal menyimpan data warga', error.message, 'error'); return; }
    await loadResidents();
    closeModal(); if (state.page === 'residents') renderApp(); toast(isEdit ? 'Data diperbarui' : 'Warga berhasil ditambahkan', `${data.name} tersimpan di data penduduk desa.`);
  }
  if (form.id === 'template-form') {
    const type = form.dataset.type;
    const { error } = await sb.from('letter_templates').upsert({ village_id: state.currentVillageId, letter_type: type, content: fd.get('content') }, { onConflict: 'village_id,letter_type' });
    if (error) { toast('Gagal menyimpan template', error.message, 'error'); return; }
    await loadTemplates();
    closeModal(); renderApp(); toast('Template berhasil disimpan', `${type} siap digunakan berulang kali.`);
  }
  if (form.id === 'decision-form') {
    const submitter = e.submitter; const decision = submitter?.value; const reason = fd.get('reason').trim();
    if (!reason) { toast('Alasan wajib diisi', 'Tuliskan catatan pemeriksaan sebelum memberi keputusan.', 'error'); return; }
    const letterId = form.dataset.id;
    const { error } = await sb.from('letters').update({ status: decision, reason, updated_at: new Date().toISOString() }).eq('id', letterId);
    if (error) { toast('Gagal menyimpan keputusan', error.message, 'error'); return; }
    const l = state.incoming.find(x => x.id === letterId);
    await loadLettersCamat();
    closeModal(); renderApp(); toast(`Surat ${decision.toLowerCase()}`, `Keputusan untuk ${l?.village || 'desa'} berhasil dikirim.`);
  }
  if (form.id === 'account-form') {
    const idx = form.dataset.index;
    if (idx === '') {
      const payload = { villageName: fd.get('name'), district: fd.get('district'), username: fd.get('username'), password: fd.get('password'), adminName: fd.get('admin'), phone: fd.get('phone') };
      const { data, error } = await sb.functions.invoke('create-village-account', { body: payload });
      if (error || data?.error) { toast('Gagal membuat akun desa', data?.error || error.message, 'error'); return; }
      await loadVillagesCamat();
      closeModal(); if (state.page === 'accounts' || state.page === 'villages') renderApp();
      toast('Akun desa berhasil dibuat', `${payload.villageName} dapat login dengan username ${payload.username}.`);
      return;
    }
    const a = state.accounts[+idx];
    const villageName = fd.get('name'), district = fd.get('district'), admin = fd.get('admin'), phone = fd.get('phone');
    const { error: vErr } = await sb.from('villages').update({ name: villageName, district }).eq('id', a.id);
    if (vErr) { toast('Gagal memperbarui data desa', vErr.message, 'error'); return; }
    await sb.from('profiles').update({ full_name: admin, phone }).eq('village_id', a.id).eq('role', 'desa');
    await loadVillagesCamat();
    closeModal(); if (state.page === 'accounts' || state.page === 'villages') renderApp(); toast('Data desa diperbarui', `${villageName} tersimpan.`);
  }
  } finally {
    clearBtnLoading(submitBtn);
  }
});

document.addEventListener('change', e => {
  const id = e.target.id; const resetPage = scope => { state.pagination = state.pagination || {}; state.pagination[scope] = 1; };
  if (id === 'status-filter') { state.statusFilter = e.target.value; resetPage('status'); renderApp(); }
  else if (id === 'status-month') { state.statusMonth = e.target.value; resetPage('status'); renderApp(); }
  else if (id === 'incoming-filter') { state.letterFilter = e.target.value; resetPage('incoming'); renderApp(); }
  else if (id === 'village-filter') { state.villageFilter = e.target.value; resetPage('incoming'); renderApp(); }
  else if (id === 'dusun-filter') { state.residentDusun = e.target.value; resetPage('residents'); renderApp(); }
  else if (id === 'gender-filter') { state.residentGender = e.target.value; resetPage('residents'); renderApp(); }
  else if (id === 'history-status-filter') { state.historyStatusFilter = e.target.value; resetPage('history'); renderApp(); }
  else if (id === 'history-village-filter') { state.historyVillageFilter = e.target.value; resetPage('history'); renderApp(); }
  else if (id === 'history-month') { state.historyMonth = e.target.value; resetPage('history'); renderApp(); }
  else if (id === 'village-status-filter') { state.villageStatusFilter = e.target.value; resetPage('villages'); renderApp(); }
  else if (id === 'account-status-filter') { state.accountStatusFilter = e.target.value; renderApp(); }
  else if (e.target.classList?.contains('hidden-file-input') && e.target.dataset.uploadType) {
    const file = e.target.files?.[0]; const type = e.target.dataset.uploadType; e.target.value = '';
    if (file) { const label = e.target.closest('.file-upload-btn'); if (label) label.classList.add('is-loading'); uploadTemplateDocx(type, file).finally(() => { if (label) label.classList.remove('is-loading'); }); }
  }
});

document.addEventListener('input', e => {
  const id = e.target.id;
  const debounced = (key, scope) => { state[key] = e.target.value; clearTimeout(window[`_t_${key}`]); window[`_t_${key}`] = setTimeout(() => { if (scope) { state.pagination = state.pagination || {}; state.pagination[scope] = 1; } renderApp(); }, 300); };
  if (id === 'inventory-search') { const q = e.target.value.toLowerCase(); $$('.letter-card[data-letter-name]').forEach(c => c.style.display = c.dataset.letterName.includes(q) ? '' : 'none'); }
  else if (id === 'resident-search') debounced('residentSearch', 'residents');
  else if (id === 'status-search') debounced('statusSearch', 'status');
  else if (id === 'incoming-search') debounced('incomingSearch', 'incoming');
  else if (id === 'history-search') debounced('historySearch', 'history');
  else if (id === 'village-search') debounced('villageSearch', 'villages');
  else if (id === 'account-search') debounced('accountSearch', null);
});

setupGlobalSearch();

// ===== Jam & tanggal berjalan di topbar =====
// Sebelumnya teksnya statis (ditulis manual di HTML): "Kamis, 13 Agustus 2026"
// dan "09:48 WITA", jadi nggak pernah berubah. Sekarang dibuat dinamis,
// dihitung dari waktu asli perangkat lalu dikonversi ke zona waktu WITA
// (Asia/Makassar, UTC+8) supaya akurat untuk kantor kecamatan/desa di
// Takalar meskipun perangkat yang dipakai di zona waktu lain.
function witaNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Makassar', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short'
    }).formatToParts(new Date()).map(p => [p.type, p.value])
  );
  const weekdayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[parts.weekday];
  const dateLabel = `${DAYS_ID_FULL[weekdayIndex]}, ${+parts.day} ${MONTHS_ID_FULL[+parts.month - 1]} ${parts.year}`;
  const hh = parts.hour === '24' ? '00' : parts.hour; // Intl kadang kasih "24" utk tengah malam
  return { dateLabel, timeLabel: `${hh}:${parts.minute} WITA` };
}
function updateTopbarClock() {
  const dateEl = $('#topbar-date'); const timeEl = $('#topbar-time');
  if (!dateEl && !timeEl) return;
  const { dateLabel, timeLabel } = witaNow();
  if (dateEl) dateEl.textContent = dateLabel;
  if (timeEl) timeEl.textContent = timeLabel;
}
updateTopbarClock();
setInterval(updateTopbarClock, 15000); // refresh tiap 15 detik, cukup buat jam menit-an di topbar

(async function init() {
  showView('login'); // tampilkan login dulu supaya tidak blank saat sesi dicek
  const overlay = document.createElement('div');
  overlay.className = 'page-loading-overlay';
  overlay.innerHTML = `<span class="btn-spinner"></span><span>Memeriksa sesi...</span>`;
  document.body.appendChild(overlay);
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
      const ok = await loadProfileAndEnter(session.user.id);
      if (!ok) { await sb.auth.signOut(); showView('login'); }
    }
  } finally {
    overlay.remove();
  }
})();
