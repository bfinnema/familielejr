# Familielejr

## Local Google Maps API Key Setup

This project reads the browser Google Maps API key from `public/env.js`.

### Files
- `public/env.example.js`: committed template file
- `public/env.js`: local file with real key (ignored by git)

### Setup
1. Copy `public/env.example.js` to `public/env.js`.
2. Set your key in `public/env.js`:

```js
window.__env = {
  GOOGLE_MAPS_KEY: "YOUR_KEY_HERE"
};
```

### Notes
- `public/env.js` is in `.gitignore` and should not be committed.
- Frontend keys are always visible in the browser; secure the key in Google Cloud with:
  - HTTP referrer restrictions
  - API restrictions (only required Maps APIs)
