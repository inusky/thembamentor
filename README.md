# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Passwordless Lead Flow

### Endpoints

- `POST /api/v1/auth/passwordless-start`
- `POST /api/v1/auth/retry`
- `GET /api/v1/auth/post-login`

### Callback ownership

- `/auth/callback` stays owned by `@auth0/auth0-nuxt`.
- Passwordless callback state is validated in `server/middleware/01-passwordless-callback-guard.ts` only when the `pwl_guard` cookie is present.

### Required environment variables

- `AUTH0_DOMAIN`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_APP_BASE_URL`
- `AUTH_SESSION_PASSWORD`
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`
- `ZOHO_CAMPAIGNS_LIST_KEY`

### Optional environment variables

- `AUTH_PASSWORDLESS_RESEND_COOLDOWN_SECONDS` (default: `90`)
- `AUTH_PASSWORDLESS_STATE_TTL_SECONDS` (default: `600`)
- `AUTH_PASSWORDLESS_SUCCESS_TTL_SECONDS` (default: `120`)
- `ZOHO_DC` (default: `zoho.in`)
- `ZOHO_CAMPAIGNS_BASE_URL` (default: `campaigns.zoho.in`)
- `TEST_MODE`
