# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Security headers

The Vercel deployment sets security headers via the `headers` block in [`vercel.json`](./vercel.json).
These mitigate the risks of keeping the auth token in `localStorage` (see `services/auth/tokenStorage.ts`)
and of signing Stellar transactions in the browser.

### Content-Security-Policy

The policy is documented here so it can be reviewed and tightened over time. It is shipped as
`Content-Security-Policy-Report-Only` first so violations surface in the console without breaking the app;
switch the header name to `Content-Security-Policy` once a preview deployment reports no violations.

| Directive | Value | Why |
| --- | --- | --- |
| `default-src` | `'self'` | Deny by default. |
| `script-src` | `'self'` | No inline/eval scripts; Vite emits external bundles. |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com` | Inline styles from React/Leaflet plus Google Fonts stylesheet. |
| `font-src` | `'self' https://fonts.gstatic.com data:` | Google Fonts files (drop if fonts are self-hosted). |
| `img-src` | `'self' data: blob: https://*.tile.openstreetmap.org` | Leaflet/OpenStreetMap tiles and inline/blob images. |
| `connect-src` | `'self'` + API origin + Soroban RPC + Sentry ingest | All XHR/fetch/WebSocket targets the app talks to. |
| `frame-ancestors` | `'none'` | Prevent clickjacking of wallet-signing flows. |
| `base-uri` | `'self'` | Block `<base>` tag injection. |
| `form-action` | `'self'` | Restrict form submissions. |
| `object-src` | `'none'` | Disallow plugins. |

`connect-src` must list every origin the app contacts: the backend API, the Soroban RPC endpoint, the
Sentry ingest host, and any other service added later. Update the list in `vercel.json` whenever a new
origin is introduced, otherwise the request will be blocked once the policy is enforced.

### Other headers

- `X-Frame-Options: DENY` — legacy fallback for `frame-ancestors`.
- `X-Content-Type-Options: nosniff` — prevent MIME sniffing.
- `Referrer-Policy: strict-origin-when-cross-origin` — password-reset tokens live in query strings, so
  full URLs must not leak to third parties via the `Referer` header.
- `Permissions-Policy` — disable camera, microphone, geolocation and other features the app does not use.
- `Strict-Transport-Security` — force HTTPS.

### Verifying

After deploying a preview, confirm the headers are present:

```sh
curl -sI https://<preview-url>/ | grep -iE 'content-security-policy|x-frame-options|referrer-policy|x-content-type-options|permissions-policy'
```

Then open the preview and check the browser console for CSP violation reports. Resolve every violation
before promoting `Content-Security-Policy-Report-Only` to the enforcing `Content-Security-Policy` header.
