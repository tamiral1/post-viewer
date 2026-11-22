# Post Viewer Redirect (Chrome extension)

Any link to IG or FB that you open in Chrome (from WhatsApp, email, anywhere) goes to
Post Viewer instead. The link is handed over base64-encoded and wiped from the address bar
as soon as the page reads it.

## Install
1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked** and pick this `extension` folder

## Share links
`facebook.com/share/...`, `fb.watch` and similar short links can't be embedded directly. For those the
extension asks the site from your own Chrome where the link points, then opens the real post. While it
looks it up the viewer says "Looking up the post…". If the lookup fails you get the original link and a note.
This needs the site permissions in `manifest.json`; after changing the extension, press the reload arrow on
`chrome://extensions`.

## Notes
- Needs your default browser to be Chrome, so links from other apps open there.
- If your site blocker is also an extension, it may block the request before this one
  redirects it. If links still hit the block page, say so and we'll switch approach.
- Change `VIEWER` in `background.js` if the page moves.
