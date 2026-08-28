# Environment Setup Guide

## Overview

This guide documents all environment variables required to deploy the Navin frontend to production. Environment variables configure API endpoints, blockchain networks, error monitoring, and other deployment-specific settings.

## Required Environment Variables

### VITE_API_BASE_URL

**Description**: The base URL for all backend API requests.

**Required**: ✅ Yes

**Format**: `https://` URL (no trailing slash)

**Examples**:
- Development: `http://localhost:3000/api`
- Staging: `https://api-staging.navin.io/api`
- Production: `https://api.navin.io/api`

**Usage**: Used by Axios client in `frontend/src/services/` for all API requests (shipments, auth, settlements, etc.)

**Security**: This URL is exposed to the browser and should point to a publicly accessible API endpoint.

---

### VITE_STELLAR_NETWORK

**Description**: Specifies which Stellar network to use for blockchain operations.

**Required**: ✅ Yes

**Valid Values**:
- `testnet` - For development and staging (uses Stellar testnet)
- `mainnet` - For production (uses live Stellar network with real XLM)

**Examples**:
- Development/Staging: `testnet`
- Production: `mainnet`

**Usage**: Read by `WalletContext` and all wallet adapters (Freighter, Albedo). Determines which network transactions are signed on.

**⚠️ WARNING**: Using `mainnet` in development will attempt to sign transactions with real XLM. Always use `testnet` for local development.

---

### VITE_SENTRY_DSN

**Description**: Sentry Data Source Name for error monitoring and reporting.

**Required**: ⚙️ Optional (recommended for production)

**Format**: Full Sentry DSN URL

**Example**: `https://your-project-key@o123456.ingest.sentry.io/7890123`

**Usage**: Enables error tracking in production builds. Sentry only initializes when `import.meta.env.PROD === true`.

**How to get it**:
1. Create a project in [Sentry](https://sentry.io/)
2. Go to Project Settings → Client Keys (DSN)
3. Copy the DSN URL
4. Set it as `VITE_SENTRY_DSN` in your deployment environment

**Security**: While the DSN is exposed to the browser, it only allows *sending* error reports to your Sentry project. It cannot be used to read data.

---

## Optional Environment Variables

### VITE_APP_ENV

**Description**: The application environment name.

**Required**: ❌ No

**Valid Values**: `development`, `staging`, `production` (or any custom string)

**Default**: Determined by Vite's mode (`import.meta.env.MODE`)

**Usage**: Can be used for environment-specific feature flags or logging.

---

### VITE_APP_VERSION

**Description**: Application version string for Sentry release tracking.

**Required**: ❌ No

**Format**: Semantic version (e.g., `1.2.3`) or git commit SHA

**Example**: `0.1.0` or `abc123f`

**Usage**: Automatically set during CI/CD builds. Links Sentry errors to specific releases.

**CI/CD Setup**:
```bash
# In your CI pipeline
export VITE_APP_VERSION=$(git rev-parse --short HEAD)
pnpm run build
```

---

## Deployment Platform Guides

### Vercel

1. Go to Project Settings → Environment Variables
2. Add each variable with appropriate values:
   - `VITE_API_BASE_URL` → Production API URL
   - `VITE_STELLAR_NETWORK` → `mainnet`
   - `VITE_SENTRY_DSN` → Your Sentry DSN
3. Deploy or trigger a redeploy

**Environment-specific config**:
- Set different values for Production, Preview, and Development branches
- Use Vercel's built-in environment variable scoping

**Docs**: https://vercel.com/docs/projects/environment-variables

---

### Netlify

1. Go to Site Settings → Environment Variables
2. Add each variable:
   - `VITE_API_BASE_URL` → Production API URL
   - `VITE_STELLAR_NETWORK` → `mainnet`
   - `VITE_SENTRY_DSN` → Your Sentry DSN
3. Trigger a redeploy

**Environment-specific config**:
- Use Netlify's context-specific variables (Production, Deploy Preview, Branch Deploy)

**Docs**: https://docs.netlify.com/environment-variables/overview/

---

### AWS Amplify

1. Go to App Settings → Environment Variables
2. Add each variable:
   - `VITE_API_BASE_URL` → Production API URL
   - `VITE_STELLAR_NETWORK` → `mainnet`
   - `VITE_SENTRY_DSN` → Your Sentry DSN
3. Redeploy the application

**Environment-specific config**:
- Create different branches (main, develop) with different variable values

**Docs**: https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html

---

### Docker

Create a `.env` file or pass variables via `docker run`:

**Using .env file**:
```bash
# .env.production
VITE_API_BASE_URL=https://api.navin.io/api
VITE_STELLAR_NETWORK=mainnet
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project
```

**Using docker run**:
```bash
docker run -p 3000:3000 \
  -e VITE_API_BASE_URL=https://api.navin.io/api \
  -e VITE_STELLAR_NETWORK=mainnet \
  -e VITE_SENTRY_DSN=https://your-dsn@sentry.io/project \
  navin-frontend:latest
```

**Using docker-compose**:
```yaml
version: '3.8'
services:
  frontend:
    image: navin-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=https://api.navin.io/api
      - VITE_STELLAR_NETWORK=mainnet
      - VITE_SENTRY_DSN=https://your-dsn@sentry.io/project
```

---

## CI/CD Pipeline Example (GitHub Actions)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
        working-directory: ./frontend
      
      - name: Build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
          VITE_STELLAR_NETWORK: mainnet
          VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
          VITE_APP_VERSION: ${{ github.sha }}
        run: pnpm run build
        working-directory: ./frontend
      
      - name: Deploy
        # Deploy dist/ to your hosting provider
        run: echo "Deploy step here"
```

**Required GitHub Secrets**:
- `VITE_API_BASE_URL`
- `VITE_SENTRY_DSN`

---

## Security Best Practices

### ✅ DO

- **Use HTTPS URLs** for `VITE_API_BASE_URL` in production
- **Store sensitive values** (Sentry DSN) in your deployment platform's secret/environment variable manager
- **Use different API URLs** for development, staging, and production
- **Use `testnet`** for all non-production environments
- **Rotate Sentry DSNs** periodically or if compromised
- **Document all variables** in `.env.example` with comments

### ❌ DON'T

- **Never commit `.env`** files to version control (already in `.gitignore`)
- **Never hardcode** API URLs or network values in source code
- **Never use `mainnet`** in local development
- **Never expose private keys** via environment variables (use secure wallet signing instead)

---

## Validation Script

Use this script to validate your environment configuration:

```bash
#!/bin/bash
# validate-env.sh

required_vars=("VITE_API_BASE_URL" "VITE_STELLAR_NETWORK")

echo "🔍 Validating environment variables..."

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ ERROR: $var is not set"
    exit 1
  else
    echo "✅ $var is set"
  fi
done

# Validate VITE_STELLAR_NETWORK value
if [[ "$VITE_STELLAR_NETWORK" != "testnet" && "$VITE_STELLAR_NETWORK" != "mainnet" ]]; then
  echo "❌ ERROR: VITE_STELLAR_NETWORK must be 'testnet' or 'mainnet'"
  exit 1
fi

# Validate VITE_API_BASE_URL format
if [[ ! "$VITE_API_BASE_URL" =~ ^https?:// ]]; then
  echo "⚠️  WARNING: VITE_API_BASE_URL should start with http:// or https://"
fi

echo "✅ All required environment variables are valid!"
```

**Run before deployment**:
```bash
chmod +x validate-env.sh
./validate-env.sh
```

---

## Troubleshooting

### Issue: API requests return 404

**Cause**: Incorrect `VITE_API_BASE_URL`

**Solution**:
1. Check that the URL is correct and accessible
2. Ensure there's no trailing slash
3. Verify the backend API is deployed and running
4. Check browser console for exact request URL

---

### Issue: Wallet signing fails

**Cause**: Wrong `VITE_STELLAR_NETWORK` or missing environment variable

**Solution**:
1. Verify `VITE_STELLAR_NETWORK` is set to `testnet` or `mainnet`
2. Ensure your wallet (Freighter/Albedo) is on the same network
3. Check browser console for network mismatch errors

---

### Issue: Sentry not tracking errors

**Cause**: Missing `VITE_SENTRY_DSN` or not a production build

**Solution**:
1. Verify `VITE_SENTRY_DSN` is set correctly
2. Ensure you're running a production build (`pnpm run build`)
3. Sentry only initializes when `import.meta.env.PROD === true`
4. Check Sentry project settings to confirm DSN is correct

---

### Issue: Environment variables not updating

**Cause**: Vite embeds environment variables at build time

**Solution**:
1. **Rebuild the application** after changing environment variables
2. Environment variables are not hot-reloaded in dev mode
3. Restart dev server: `pnpm run dev`
4. Clear browser cache if necessary

---

## Additional Resources

- [Vite Environment Variables Docs](https://vite.dev/guide/env-and-mode.html)
- [Stellar Network Overview](https://developers.stellar.org/docs/fundamentals-and-concepts/networks)
- [Sentry Documentation](https://docs.sentry.io/)
- [Navin Backend API Documentation](https://github.com/Navin-xmr/navin-backend)
