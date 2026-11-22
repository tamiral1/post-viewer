// Sends top-level visits to IG / FB over to Post Viewer.
// Only the main frame is touched, so embeds inside other pages keep working.
//
// Short links (facebook.com/share/..., fb.watch, instagram.com/share/...) can't be embedded as-is.
// For those, this asks the site from your own browser (a normal request, with your own session)
// where the link points, and hands the viewer the real post address.
const VIEWER = 'https://post-viewer-ten.vercel.app/';
const HOSTS = ['facebook.com', 'fb.com', 'fb.watch', 'fb.me', 'instagram.com', 'instagr.am'];
const isTarget = h => HOSTS.some(d => h === d || h.endsWith('.' + d));

// share / short links that need their destination looked up
function isShort(u) {
  const h = u.hostname.toLowerCase();
  if (h === 'fb.watch' || h === 'fb.me') return true;
  return /^\/share(\/|$)/.test(u.pathname) && isTarget(h);
}

// url-safe base64, so the page address never contains the plain post link
function encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const decodeEntities = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");
function usable(href, original) {
  try {
    const u = new URL(href);
    return u.protocol === 'https:' && isTarget(u.hostname) && !isShort(u) && href !== original;
  } catch { return false; }
}

// Returns the real post URL, or null if it couldn't be worked out.
async function resolve(url) {
  try {
    const r = await fetch(url, { credentials: 'include', redirect: 'follow', signal: AbortSignal.timeout(6000) });
    if (usable(r.url, url)) return r.url;
    const html = (await r.text()).slice(0, 400000);
    const m = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    if (m && usable(decodeEntities(m[1]), url)) return decodeEntities(m[1]);
  } catch {}
  return null;
}

const go = (tabId, hash) => chrome.tabs.update(tabId, { url: VIEWER + '#' + hash }).catch(() => {});

chrome.webNavigation.onBeforeNavigate.addListener(async details => {
  if (details.frameId !== 0) return;
  let u;
  try { u = new URL(details.url); } catch { return; }
  if (!isTarget(u.hostname)) return;

  // l.facebook.com/l.php?u=<other site> is just a trampoline to somewhere else: leave it alone
  const wrapped = u.searchParams.get('u');
  if (wrapped && (u.pathname === '/l.php' || u.hostname.startsWith('l.'))) {
    try { if (!isTarget(new URL(wrapped).hostname)) return; } catch { return; }
  }

  if (!isShort(u)) { go(details.tabId, encode(details.url)); return; }

  // short link: open the viewer straight away in a "looking it up" state, then send the real address
  go(details.tabId, '~' + encode(details.url));
  const real = await resolve(details.url);
  go(details.tabId, encode(real || details.url));
}, { url: HOSTS.map(d => ({ hostSuffix: d })) });
