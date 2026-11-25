// Panel «Control de misión». Todo el texto se inserta con textContent (sin HTML del usuario).
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, props = {}, ...children) => {
  const n = Object.assign(document.createElement(tag), props);
  n.append(...children.filter((c) => c !== null && c !== undefined));
  return n;
};
const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' })
    : '—';
const statusClass = (s) => `badge s-${String(s).replace(/\s+/g, '-')}`;
const NOTIFY_LABEL = { enviado: 'Enviado', fallido: 'Falló', pendiente: 'Pendiente' };

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: {
      'x-requested-with': 'aia-admin',
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/api/admin/login') {
    showLogin();
    throw new Error(data.message || 'Sesión expirada.');
  }
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

const state = { status: '', program: '', q: '', statuses: [], programs: {} };

// ---------- Sesión ----------
function showLogin() {
  $('#app-view').hidden = true;
  $('#login-view').hidden = false;
  $('#login-form [name=email]').focus();
}

async function showApp(admin) {
  $('#who-name').textContent = admin.name;
  $('#login-view').hidden = true;
  $('#app-view').hidden = false;
  await loadList();
  route();
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const btn = form.querySelector('button');
  $('#login-error').textContent = '';
  btn.disabled = true;
  try {
    const { admin } = await api('/api/admin/login', {
      method: 'POST',
      body: { email: form.email.value, password: form.password.value },
    });
    form.password.value = '';
    await showApp(admin);
  } catch (err) {
    $('#login-error').textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});

$('#logout').addEventListener('click', async () => {
  await api('/api/admin/logout', { method: 'POST' }).catch(() => {});
  location.hash = '#/';
  showLogin();
});

// ---------- Lista ----------
async function loadList() {
  const params = new URLSearchParams();
  if (state.status) params.set('status', state.status);
  if (state.program) params.set('program', state.program);
  if (state.q) params.set('q', state.q);
  const data = await api(`/api/admin/leads?${params}`);
  state.statuses = data.statuses;
  state.programs = data.programs;
  fillFilters();
  for (const [k, v] of Object.entries(data.counts)) {
    const node = document.getElementById(`m-${k}`);
    if (node) node.textContent = v;
  }
  document.querySelectorAll('[data-filter-status]').forEach((b) =>
    b.setAttribute('aria-pressed', String(b.dataset.filterStatus === state.status)),
  );
  const rows = $('#rows');
  rows.replaceChildren(
    ...data.leads.map((l) => {
      const link = el('a', { href: `#/lead/${l.id}`, textContent: l.name });
      return el(
        'tr',
        {},
        el('td', { className: 'who-cell' }, link, el('span', { className: 'sub', textContent: l.email })),
        el('td', { textContent: l.programName }),
        el('td', {}, el('span', { className: statusClass(l.status), textContent: l.status })),
        el('td', { textContent: fmt(l.createdAt) }),
        el('td', {}, el('span', { className: `notify n-${l.notifyStatus}`, textContent: NOTIFY_LABEL[l.notifyStatus] })),
      );
    }),
  );
  $('#empty').hidden = data.leads.length > 0;
}

let filtersFilled = false;
function fillFilters() {
  if (filtersFilled) return;
  filtersFilled = true;
  $('#status-filter').append(...state.statuses.map((s) => el('option', { value: s, textContent: s })));
  $('#program-filter').append(
    ...Object.entries(state.programs).map(([v, t]) => el('option', { value: v, textContent: t })),
  );
}

let searchTimer;
$('#search').addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.q = e.target.value.trim();
    loadList();
  }, 250);
});
$('#status-filter').addEventListener('change', (e) => {
  state.status = e.target.value;
  loadList();
});
$('#program-filter').addEventListener('change', (e) => {
  state.program = e.target.value;
  loadList();
});
document.querySelectorAll('[data-filter-status]').forEach((b) =>
  b.addEventListener('click', () => {
    state.status = b.dataset.filterStatus;
    $('#status-filter').value = state.status;
    loadList();
  }),
);
$('#refresh').addEventListener('click', () => loadList());

// ---------- Detalle ----------
let current = null;

function eventText(e) {
  switch (e.type) {
    case 'creado':
      return 'Registro creado con estado «Nuevo» (formulario de la landing)';
    case 'estado':
      return `Estado: «${e.from_status}» → «${e.to_status}»`;
    case 'nota':
      return `Nota añadida: «${e.detail.length > 120 ? `${e.detail.slice(0, 120)}…` : e.detail}»`;
    case 'aviso':
      return e.detail;
    default:
      return e.type;
  }
}

function renderDetail({ lead, notes, events, statuses }) {
  current = lead;
  $('#d-program').textContent = lead.programName;
  $('#d-name').textContent = lead.name;
  const email = $('#d-email');
  email.textContent = lead.email;
  email.href = `mailto:${lead.email}`;
  $('#d-phone').textContent = lead.phone || 'No lo proporcionó';
  $('#d-created').textContent = fmt(lead.createdAt);
  $('#d-id').textContent = lead.id;
  const notify = $('#d-notify');
  notify.className = `notify n-${lead.notifyStatus}`;
  notify.textContent =
    lead.notifyStatus === 'enviado'
      ? `Enviado · ${fmt(lead.notifiedAt)}`
      : `${NOTIFY_LABEL[lead.notifyStatus]}${lead.notifyError ? ` · ${lead.notifyError}` : ''}`;
  $('#d-retry').hidden = lead.notifyStatus === 'enviado';

  $('#d-status').replaceChildren(
    ...statuses.map((s) =>
      el('button', {
        type: 'button',
        role: 'radio',
        textContent: s,
        ariaChecked: String(s === lead.status),
        onclick: () => changeStatus(s),
      }),
    ),
  );
  renderNotes(notes);
  renderEvents(events);
}

function renderNotes(notes) {
  $('#d-notes').replaceChildren(
    ...(notes.length
      ? notes.map((n) =>
          el('li', {}, el('p', { textContent: n.body }), el('p', { className: 'meta', textContent: `${n.author} · ${fmt(n.created_at)}` })),
        )
      : [el('li', { className: 'muted', textContent: 'Aún no hay notas.' })]),
  );
}

function renderEvents(events) {
  $('#d-events').replaceChildren(
    ...events.map((e) =>
      el('li', {}, el('p', { className: 'what', textContent: eventText(e) }), el('p', { className: 'meta', textContent: `${e.author} · ${fmt(e.created_at)}` })),
    ),
  );
}

async function openDetail(id) {
  $('#detail').hidden = false;
  try {
    renderDetail(await api(`/api/admin/leads/${encodeURIComponent(id)}`));
    $('#d-name').focus?.();
  } catch (err) {
    $('#d-name').textContent = err.message;
  }
}

async function changeStatus(status) {
  if (!current || status === current.status) return;
  const msg = $('#status-msg');
  msg.textContent = 'Guardando…';
  try {
    const data = await api(`/api/admin/leads/${current.id}/status`, { method: 'PATCH', body: { status } });
    current = data.lead;
    document.querySelectorAll('#d-status [role=radio]').forEach((b) => (b.ariaChecked = String(b.textContent === status)));
    renderEvents(data.events);
    msg.textContent = `Estado guardado: ${status}.`;
    loadList();
  } catch (err) {
    msg.textContent = err.message;
  }
}

$('#note-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = $('#note-body').value.trim();
  const msg = $('#note-msg');
  const btn = e.currentTarget.querySelector('button');
  if (body.length < 2) {
    msg.textContent = 'Escribe la nota (mínimo 2 caracteres).';
    return;
  }
  btn.disabled = true;
  msg.textContent = 'Guardando…';
  try {
    const data = await api(`/api/admin/leads/${current.id}/notes`, { method: 'POST', body: { body } });
    $('#note-body').value = '';
    renderNotes(data.notes);
    renderEvents(data.events);
    msg.textContent = 'Nota guardada.';
    loadList();
  } catch (err) {
    msg.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});

$('#d-retry').addEventListener('click', async () => {
  if (!current) return;
  $('#d-retry').disabled = true;
  try {
    await api(`/api/admin/leads/${current.id}/notify`, { method: 'POST' });
    await openDetail(current.id);
    loadList();
  } finally {
    $('#d-retry').disabled = false;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('#detail').hidden) location.hash = '#/';
});

function route() {
  const m = location.hash.match(/^#\/lead\/([0-9a-f-]{36})$/i);
  if (m) openDetail(m[1]);
  else {
    $('#detail').hidden = true;
    current = null;
  }
}
window.addEventListener('hashchange', route);

// ---------- Arranque ----------
api('/api/admin/me')
  .then(({ admin }) => (admin ? showApp(admin) : showLogin()))
  .catch(() => showLogin());
