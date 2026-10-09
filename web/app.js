// Pet-sy SEO dashboard. Vanilla JS, no build step. All data is rendered with
// textContent / DOM nodes - never innerHTML - because findings contain text from crawled sites.

const main = document.getElementById('main');
const rail = document.getElementById('rail');
const nav = document.getElementById('nav');
const wsSelect = document.getElementById('workspace');
let me = null;
let pollTimer = null;

// ------------------------------------------------------------------ helpers
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style') {
      // CSSOM writes are allowed by our CSP (style-src 'self'); style="" attributes are not.
      for (const decl of String(v).split(';')) {
        const i = decl.indexOf(':');
        if (i > 0) el.style.setProperty(decl.slice(0, i).trim(), decl.slice(i + 1).trim());
      }
    }
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

async function api(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status; err.code = data?.error;
    throw err;
  }
  return data;
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 3500);
}

const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'];
const SEV_LABEL = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low', info: 'Info' };
const fmtDate = (d) => d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';

function render(...nodes) {
  clearTimeout(pollTimer);
  main.replaceChildren(...nodes.flat().filter((n) => n !== null && n !== undefined && n !== false));
  main.focus({ preventScroll: true });
}

function errorLine() { return h('p', { class: 'form-error', role: 'alert' }); }

// ------------------------------------------------------------------ shell
async function loadMe() {
  try { me = await api('GET', '/api/me'); } catch (e) { if (e.status === 401) me = null; else throw e; }
  return me;
}

async function refreshRail(current) {
  if (!me) { rail.hidden = true; document.querySelector('.shell').classList.add('no-rail'); return; }
  rail.hidden = false;
  document.querySelector('.shell').classList.remove('no-rail');
  wsSelect.replaceChildren(...me.memberships.map((m) => h('option', { value: m.id, selected: me.activeTenant?.id === m.id }, m.name)));
  let sites = [];
  if (me.activeTenant) { try { sites = (await api('GET', '/api/sites')).sites; } catch { /* shown in view */ } }
  const link = (href, label, cls) => h('a', { href, class: cls, 'aria-current': current === href ? 'page' : null }, label);
  nav.replaceChildren(...[
    link('#/sites', 'Websites'),
    link('#/add', 'Add a website'),
    link('#/plan', 'Plan & features'),
    link('#/activity', 'Activity'),
    sites.length ? h('div', { class: 'sites-head' }, 'Your websites') : null,
    ...sites.map((s) => link(`#/sites/${s.id}`, s.domain, 'site-link')),
  ].filter(Boolean));
}

wsSelect.addEventListener('change', async () => {
  await api('POST', '/api/tenants/active', { tenantId: wsSelect.value });
  await loadMe();
  location.hash = '#/sites';
  route();
});
document.getElementById('logout').addEventListener('click', async () => {
  await api('POST', '/api/auth/logout');
  me = null;
  location.hash = '#/login';
  route();
});

// ------------------------------------------------------------------ auth views
function authView(mode) {
  const err = errorLine();
  const isReg = mode === 'register';
  const form = h('form', { class: 'stack', novalidate: true },
    isReg && h('label', { class: 'field' }, 'Your name', h('input', { name: 'name', autocomplete: 'name', required: true })),
    isReg && h('label', { class: 'field' }, 'Business name', h('span', { class: 'hint' }, 'Becomes your workspace. You can add more later.'), h('input', { name: 'company', autocomplete: 'organization', required: true })),
    h('label', { class: 'field' }, 'Email', h('input', { name: 'email', type: 'email', autocomplete: 'email', required: true })),
    h('label', { class: 'field' }, 'Password', isReg && h('span', { class: 'hint' }, 'At least 10 characters.'),
      h('input', { name: 'password', type: 'password', autocomplete: isReg ? 'new-password' : 'current-password', required: true, minlength: isReg ? 10 : null })),
    err,
    h('button', { class: 'btn', type: 'submit' }, isReg ? 'Create account' : 'Sign in'),
  );
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    err.textContent = '';
    const data = Object.fromEntries(new FormData(form));
    const btn = form.querySelector('button');
    btn.disabled = true;
    try {
      await api('POST', isReg ? '/api/auth/register' : '/api/auth/login', data);
      await loadMe();
      location.hash = isReg ? '#/add' : '#/sites';
    } catch (e) { err.textContent = e.message; } finally { btn.disabled = false; }
  });
  render(h('div', { class: 'auth' },
    h('div', { class: 'brand' }, h('img', { src: '/icon.svg', alt: '', width: 28, height: 28 }), h('span', {}, 'Pet-sy SEO')),
    h('h1', {}, isReg ? 'Check how your website looks to Google' : 'Sign in'),
    isReg && h('p', { class: 'lede' }, 'Add your website and get a first technical check in a few minutes. No Google account or website login needed to start.'),
    form,
    h('p', { class: 'muted small', style: 'margin-top:1.5rem' }, isReg ? 'Already have an account? ' : 'New here? ',
      h('a', { href: isReg ? '#/login' : '#/register' }, isReg ? 'Sign in' : 'Create an account')),
  ));
}

// ------------------------------------------------------------------ sites list
async function sitesView() {
  const { sites } = await api('GET', '/api/sites');
  if (!sites.length) {
    return render(
      h('h1', {}, 'Websites'),
      h('div', { class: 'empty' },
        h('h3', {}, 'Add your first website'),
        h('p', { class: 'muted' }, 'We will check pages, titles, descriptions, links, languages and more, and show you exactly what to fix.'),
        h('a', { class: 'btn', href: '#/add' }, 'Add a website')),
    );
  }
  render(
    h('h1', {}, 'Websites'),
    h('p', { class: 'lede' }, 'Technical health of each website, from the latest check.'),
    h('div', {}, ...sites.map((s) => {
      const lr = s.last_run;
      const score = lr?.health_score;
      return h('a', { class: 'site-row', href: `#/sites/${s.id}` },
        h('div', {}, h('strong', {}, s.domain), h('div', { class: 'muted small' },
          lr ? `Last check ${fmtDate(lr.finished_at || lr.created_at)} · ${s.open_issues} open issue${s.open_issues === 1 ? '' : 's'}` : 'Not checked yet')),
        h('span', { class: `chip ${s.verified_at ? 'ok' : 'warn'}` }, s.verified_at ? 'Verified' : 'Not verified'),
        h('span', { class: 'score', title: 'Technical health score (our formula, not a Google metric)' }, score ?? '—'),
      );
    })),
  );
}

// ------------------------------------------------------------------ add site
function addSiteView() {
  const err = errorLine();
  const form = h('form', { class: 'stack', style: 'max-width:36rem' },
    h('label', { class: 'field' }, 'Website address', h('span', { class: 'hint' }, 'For example yourbusiness.com'), h('input', { name: 'url', required: true, inputmode: 'url', autocomplete: 'url' })),
    h('label', { class: 'field' }, 'Industry', h('input', { name: 'industry', placeholder: 'Pet shop, dental clinic, car repair…' })),
    h('label', { class: 'field' }, 'Main market', h('input', { name: 'market', placeholder: 'Country or city, e.g. Dubai, UAE' })),
    h('label', { class: 'field' }, 'Website languages', h('span', { class: 'hint' }, 'Language codes separated by commas, e.g. en, ar, ru'), h('input', { name: 'languages', placeholder: 'en' })),
    h('label', { class: 'field' }, 'What do you want from search?', h('textarea', { name: 'goals', placeholder: 'More calls and WhatsApp enquiries for puppies in Dubai' })),
    err,
    h('div', { class: 'row' }, h('button', { class: 'btn', type: 'submit' }, 'Add website and start check')),
  );
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    err.textContent = '';
    const f = Object.fromEntries(new FormData(form));
    const languages = String(f.languages || '').split(',').map((x) => x.trim()).filter(Boolean);
    const btn = form.querySelector('button');
    btn.disabled = true;
    try {
      const r = await api('POST', '/api/sites', { url: f.url, industry: f.industry, market: f.market, goals: f.goals, languages, startCheck: true });
      if (r.checkError) toast(r.checkError);
      location.hash = `#/sites/${r.id}`;
    } catch (e) { err.textContent = e.message; } finally { btn.disabled = false; }
  });
  render(
    h('h1', {}, 'Add a website'),
    h('p', { class: 'lede' }, 'We start with a quick, read-only check of up to 10 pages. Verify ownership afterwards to unlock full crawls and daily checks.'),
    form,
  );
}

// ------------------------------------------------------------------ site detail
function triageStrip(bySev) {
  const total = SEVERITIES.reduce((n, s) => n + (bySev?.[s] ?? 0), 0);
  const strip = h('div', { class: 'triage', role: 'img', 'aria-label': total ? SEVERITIES.map((s) => `${bySev[s] ?? 0} ${s}`).join(', ') : 'No open issues' });
  if (!total) strip.append(h('div', { class: 'none' }, 'No open issues'));
  for (const s of SEVERITIES) {
    const n = bySev?.[s] ?? 0;
    if (n) strip.append(h('div', { class: `sev-${s}`, style: `flex-grow:${n}`, title: `${n} ${SEV_LABEL[s]}` }, n));
  }
  return [strip, h('div', { class: 'legend' }, ...SEVERITIES.map((s) => h('span', { style: `--c:var(--${s})` }, `${SEV_LABEL[s]} ${bySev?.[s] ?? 0}`)))];
}

function verificationPanel(site, verification, onVerified) {
  if (site.verified_at) {
    return h('div', { class: 'panel' }, h('div', { class: 'row' }, h('span', { class: 'chip ok' }, 'Verified'),
      h('span', { class: 'muted small' }, `Ownership confirmed ${fmtDate(site.verified_at)} by ${site.verification_method === 'dns' ? 'DNS record' : site.verification_method === 'file' ? 'file' : 'meta tag'}.`)));
  }
  const out = h('p', { class: 'small', role: 'status' });
  const method = (key, title, how, value) => h('div', {},
    h('h3', {}, title), h('p', { class: 'muted small' }, how), h('div', { class: 'code' }, value),
    h('button', { class: 'btn secondary', type: 'button', onclick: async (ev) => {
      ev.target.disabled = true;
      out.textContent = 'Checking…';
      try {
        const r = await api('POST', `/api/sites/${site.id}/verify`, { method: key });
        out.textContent = r.detail;
        if (r.ok) { toast('Website verified'); onVerified(); }
      } catch (e) { out.textContent = e.message; } finally { ev.target.disabled = false; }
    } }, 'Check now'));
  return h('div', { class: 'panel attention' },
    h('h3', {}, 'Verify that this website is yours'),
    h('p', { class: 'muted' }, 'Until then we only run a short read-only check of up to 10 pages. Verification unlocks full crawls and daily checks. Pick one method:'),
    h('div', { class: 'methods' },
      method('meta', 'Meta tag', 'Paste into the <head> of your homepage.', verification.meta),
      method('dns', 'DNS record', `Add a TXT record on ${verification.dns.host} at your domain provider.`, verification.dns.value),
      method('file', 'File', `Upload a file at ${verification.file.path} containing only this code.`, verification.file.content)),
    out);
}

function findingNode(i, onChange) {
  const ev = Object.keys(i.evidence || {}).length ? JSON.stringify(i.evidence, null, 2) : null;
  return h('details', { class: 'finding', style: `--c:var(--${i.severity})` },
    h('summary', {},
      h('span', { class: 't' }, i.title),
      h('span', { class: 'count' }, SEV_LABEL[i.severity], h('br'), i.occurrences > 1 ? `seen ${i.occurrences}×` : 'new'),
      h('span', { class: 'u' }, i.url || 'Whole website', i.detail ? ` — ${i.detail}` : '')),
    h('div', { class: 'body' },
      h('p', {}, h('strong', {}, 'Why it matters: '), i.why),
      h('p', {}, h('strong', {}, 'How to fix: '), i.fix),
      ev && h('div', {}, h('div', { class: 'muted small' }, 'Evidence from the check'), h('pre', { class: 'code' }, ev)),
      h('p', { class: 'muted small' }, `First seen ${fmtDate(i.first_seen_at)} · last seen ${fmtDate(i.last_seen_at)}`),
      h('div', { class: 'actions' },
        h('button', { class: 'btn secondary', type: 'button', onclick: async () => {
          await api('PATCH', `/api/issues/${i.id}`, { status: i.status === 'ignored' ? 'open' : 'ignored' });
          toast(i.status === 'ignored' ? 'Issue reopened' : 'Issue ignored');
          onChange();
        } }, i.status === 'ignored' ? 'Reopen' : 'Ignore this issue'))));
}

async function siteView(id) {
  const [{ site, verification }, { runs }, tenant] = await Promise.all([
    api('GET', `/api/sites/${id}`), api('GET', `/api/sites/${id}/audits`), api('GET', '/api/tenant'),
  ]);
  const latest = runs[0];
  const lastDone = runs.find((r) => r.status === 'succeeded');
  const active = latest && (latest.status === 'queued' || latest.status === 'running');
  const canEdit = ['owner', 'admin', 'editor'].includes(tenant.role);
  const rerender = () => siteView(id);

  let statusFilter = 'open';
  const issuesBox = h('div', {});
  async function loadIssues() {
    const { issues } = await api('GET', `/api/sites/${id}/issues?status=${statusFilter}`);
    if (!issues.length) {
      issuesBox.replaceChildren(h('p', { class: 'muted' }, statusFilter === 'open'
        ? (lastDone ? 'Nothing open. Run a new check after you change your website.' : 'Results appear here when the first check finishes.')
        : 'Nothing here.'));
      return;
    }
    const groups = SEVERITIES.map((s) => [s, issues.filter((i) => i.severity === s)]).filter(([, l]) => l.length);
    issuesBox.replaceChildren(...groups.flatMap(([s, list]) => [
      h('div', { class: 'group-head' }, h('h3', {}, SEV_LABEL[s]), h('span', { class: 'muted small num' }, `${list.length}`)),
      ...list.map((i) => findingNode(i, loadIssues)),
    ]));
  }
  const filterBtns = ['open', 'resolved', 'ignored'].map((s) => h('button', { type: 'button', 'aria-pressed': String(s === statusFilter), onclick: () => {
    statusFilter = s;
    filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.textContent.toLowerCase() === s)));
    loadIssues();
  } }, s[0].toUpperCase() + s.slice(1)));

  const runBtn = h('button', { class: 'btn', type: 'button', disabled: active || !canEdit, onclick: async () => {
    runBtn.disabled = true;
    try {
      const r = await api('POST', `/api/sites/${id}/audits`);
      toast(r.kind === 'full' ? 'Full check started' : 'Quick check started');
      rerender();
    } catch (e) { toast(e.message); runBtn.disabled = false; }
  } }, site.verified_at ? 'Run full check' : 'Run quick check');

  const scheduleToggle = site.verified_at && canEdit ? h('label', { class: 'row small' },
    h('input', { type: 'checkbox', checked: site.schedule_enabled, style: 'width:auto', onchange: async (ev) => {
      try {
        await api('PATCH', `/api/sites/${id}`, { scheduleEnabled: ev.target.checked });
        toast(ev.target.checked ? 'Daily checks on' : 'Daily checks off');
      } catch (e) { ev.target.checked = !ev.target.checked; toast(e.message); }
    } }), 'Check automatically every day') : null;

  const s = lastDone?.summary;
  render(
    h('h1', {}, site.domain),
    h('div', { class: 'row', style: 'margin-bottom:.4rem' },
      h('span', { class: `chip ${site.verified_at ? 'ok' : 'warn'}` }, site.verified_at ? 'Verified' : 'Not verified'),
      h('span', { class: 'chip off' }, 'Google Search Console: not connected'),
      h('span', { class: 'chip off' }, 'Website editing: not connected')),
    h('p', { class: 'muted small' }, [site.industry, site.market, site.languages?.length ? `Languages: ${site.languages.join(', ')}` : ''].filter(Boolean).join(' · ')),
    verificationPanel(site, verification, rerender),
    h('div', { class: 'row', style: 'margin-top:1.5rem' }, runBtn, scheduleToggle,
      active ? h('span', { class: 'run-status' }, h('span', { class: 'pulse', 'aria-hidden': 'true' }),
        `${latest.kind === 'full' ? 'Full' : 'Quick'} check ${latest.status === 'queued' ? 'waiting to start' : 'running'}…`) : null,
      latest?.status === 'failed' ? h('span', { class: 'chip bad' }, `Last check failed: ${latest.error || 'unknown error'}`) : null),
    h('h2', {}, 'Open issues'),
    s ? triageStrip(s.open_by_severity) : h('p', { class: 'muted' }, active ? 'The first results usually take a minute or two.' : 'No completed check yet.'),
    s ? h('dl', { class: 'summary-grid' },
      h('div', {}, h('dt', {}, 'Technical health score'), h('dd', {}, `${s.health_score} / 100`)),
      h('div', {}, h('dt', {}, 'Pages checked'), h('dd', {}, `${s.pages_crawled}${s.stopped_reason === 'page_limit_reached' ? ' (plan limit)' : ''}`)),
      h('div', {}, h('dt', {}, 'Pages in sitemap'), h('dd', {}, s.sitemap_urls)),
      h('div', {}, h('dt', {}, 'Last check'), h('dd', {}, `${lastDone.kind === 'full' ? 'Full' : 'Quick'}, ${fmtDate(lastDone.finished_at)}`)),
    ) : null,
    s ? h('p', { class: 'muted small', style: 'margin-top:1rem' }, `${s.health_score_note} ${s.not_measured}`) : null,
    h('h2', {}, 'Findings'),
    h('div', { class: 'filters', role: 'group', 'aria-label': 'Show issues' }, ...filterBtns),
    issuesBox,
    h('h2', {}, 'Check history'),
    runs.length ? h('div', { class: 'table-scroll' }, h('table', {},
      h('thead', {}, h('tr', {}, h('th', {}, 'Started'), h('th', {}, 'Type'), h('th', {}, 'Trigger'), h('th', {}, 'Status'), h('th', {}, 'Pages'), h('th', {}, 'New / resolved'))),
      h('tbody', {}, ...runs.map((r) => h('tr', {},
        h('td', {}, fmtDate(r.created_at)), h('td', {}, r.kind === 'full' ? 'Full' : 'Quick'), h('td', {}, r.trigger),
        h('td', {}, r.status === 'failed' ? h('span', { class: 'chip bad', title: r.error || '' }, 'failed') : r.status),
        h('td', { class: 'num' }, r.pages_crawled),
        h('td', { class: 'num' }, r.summary?.new_issues !== undefined ? `${r.summary.new_issues} / ${r.summary.resolved_issues}` : '—')))))) : h('p', { class: 'muted' }, 'No checks yet.'),
  );
  loadIssues();
  if (active) pollTimer = setTimeout(rerender, 4000);
}

// ------------------------------------------------------------------ plan & features
async function planView() {
  const t = await api('GET', '/api/tenant');
  const e = t.plan.entitlements;
  const statusChip = { available: ['ok', 'Available'], not_configured: ['off', 'Not configured'], not_implemented: ['off', 'Not built yet'] };
  render(
    h('h1', {}, 'Plan & features'),
    h('p', { class: 'lede' }, `${t.tenant.name} is on the ${t.plan.name} plan. Limits are enforced on our servers.`),
    h('dl', { class: 'summary-grid' },
      h('div', {}, h('dt', {}, 'Websites'), h('dd', {}, `${t.usage.sites} of ${e.max_sites}`)),
      h('div', {}, h('dt', {}, 'Manual checks today'), h('dd', {}, `${t.usage.manual_audits_today} of ${e.manual_audits_per_day}`)),
      h('div', {}, h('dt', {}, 'Pages checked this month'), h('dd', {}, `${t.usage.pages_crawled_this_month} of ${e.pages_per_month}`)),
      h('div', {}, h('dt', {}, 'Pages per full check'), h('dd', {}, e.max_pages_per_crawl)),
      h('div', {}, h('dt', {}, 'Daily automatic checks'), h('dd', {}, e.scheduled_audits ? 'Included' : 'Not included')),
      h('div', {}, h('dt', {}, 'Team seats'), h('dd', {}, `${t.usage.seats} of ${e.seats}`)),
    ),
    h('p', { class: 'muted small', style: 'margin-top:1rem' }, `Price: ${typeof t.plan.price === 'number' ? (t.plan.price / 100).toFixed(2) : t.plan.price}.`),
    h('h2', {}, 'What works today'),
    h('ul', { class: 'caps-list' }, ...t.capabilities.map((c) => h('li', {},
      h('strong', {}, c.name), h('span', { class: `chip ${statusChip[c.status][0]}` }, statusChip[c.status][1]),
      h('span', { class: 'note' }, c.note)))),
  );
}

async function activityView() {
  const { activity } = await api('GET', '/api/activity');
  const label = (a) => ({
    'account.registered': 'Account created', 'tenant.created': 'Workspace created', 'site.added': 'Website added',
    'site.updated': 'Website settings changed', 'site.deleted': 'Website removed', 'site.verified': 'Website verified',
    'audit.requested': 'Check requested', 'audit.completed': 'Check finished', 'issue.ignored': 'Issue ignored', 'issue.open': 'Issue reopened',
    'schedule.skipped': 'Daily check skipped',
  }[a.action] || a.action);
  render(
    h('h1', {}, 'Activity'),
    h('p', { class: 'lede' }, 'Everything people and the system did in this workspace.'),
    activity.length ? h('div', { class: 'table-scroll' }, h('table', {},
      h('thead', {}, h('tr', {}, h('th', {}, 'When'), h('th', {}, 'What'), h('th', {}, 'Who'), h('th', {}, 'Details'))),
      h('tbody', {}, ...activity.map((a) => h('tr', {},
        h('td', {}, fmtDate(a.created_at)), h('td', {}, label(a)),
        h('td', {}, a.actor_email || (a.actor_kind === 'agent' ? 'SEO agent' : 'System')),
        h('td', { class: 'wrap small muted' }, Object.entries(a.detail || {}).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · '))))))) : h('p', { class: 'muted' }, 'Nothing yet.'),
  );
}

// ------------------------------------------------------------------ router
async function route() {
  const hash = location.hash || '#/sites';
  try {
    if (me === null) await loadMe();
    if (!me && !['#/login', '#/register'].includes(hash)) { location.hash = '#/register'; return; }
    if (me && ['#/login', '#/register'].includes(hash)) { location.hash = '#/sites'; return; }
    await refreshRail(hash.startsWith('#/sites/') ? hash : hash);
    if (hash === '#/login') return authView('login');
    if (hash === '#/register') return authView('register');
    if (hash === '#/add') return addSiteView();
    if (hash === '#/plan') return planView();
    if (hash === '#/activity') return activityView();
    const m = /^#\/sites\/([0-9a-f-]{36})$/.exec(hash);
    if (m) return await siteView(m[1]);
    return await sitesView();
  } catch (e) {
    if (e.status === 401) { me = null; location.hash = '#/login'; return; }
    render(h('h1', {}, 'Something went wrong'), h('p', {}, e.message), h('a', { class: 'btn secondary', href: '#/sites' }, 'Back to websites'));
  }
}

window.addEventListener('hashchange', route);
route();
