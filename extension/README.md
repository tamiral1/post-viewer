# Post Viewer Redirect (Chrome extension)

Any link to IG or FB that you open in Chrome (from WhatsApp, email, anywhere) goes to
Post Viewer instead. The link is handed over base64-encoded and wiped from the address bar
as soon as the page reads it.

## Install
1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked** and pick this `extension` folder

## Notes
- Needs your default browser to be Chrome, so links from other apps open there.
- If your site blocker is also an extension, it may block the request before this one
  redirects it. If links still hit the block page, say so and we'll switch approach.
- Change `VIEWER` in `background.js` if the page moves.
