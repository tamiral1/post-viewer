// Sends top-level visits to IG / FB over to Post Viewer.
// Only the main frame is touched, so embeds inside other pages keep working.
const VIEWER = 'https://post-viewer-ten.vercel.app/';
const HOSTS = ['facebook.com', 'fb.com', 'fb.watch', 'instagram.com', 'instagr.am'];
const isTarget = h => HOSTS.some(d => h === d || h.endsWith('.' + d));

// url-safe base64, so the page address never contains the plain post link
function encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

chrome.webNavigation.onBeforeNavigate.addListener(details => {
  if (details.frameId !== 0) return;
  let u;
  try { u = new URL(details.url); } catch { return; }
  if (!isTarget(u.hostname)) return;

  // l.facebook.com/l.php?u=<other site> is just a trampoline to somewhere else: leave it alone
  const wrapped = u.searchParams.get('u');
  if (wrapped && (u.pathname === '/l.php' || u.hostname.startsWith('l.'))) {
    try { if (!isTarget(new URL(wrapped).hostname)) return; } catch { return; }
  }

  chrome.tabs.update(details.tabId, { url: VIEWER + '#' + encode(details.url) });
}, { url: HOSTS.map(d => ({ hostSuffix: d })) });
