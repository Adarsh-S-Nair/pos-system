This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database housekeeping

This job enforces data hygiene; verification still checks expiry/claimed at read-time.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase IaC quickstart

1. Install CLI: `brew install supabase/tap/supabase` or `npx supabase@latest`
2. One-time: `supabase init` and `supabase start` to boot local DB
3. Apply migrations locally: `npm run db:dev:reset`
4. Create a new migration: `npm run db:mig:new add_whatever` → edit the SQL file
5. Generate a diff migration: `npm run db:mig:gen -- --use-pgschema public --file add_changes`
6. Link remote project: `supabase link --project-ref <ref>`
7. Push migrations remotely: `npm run db:mig:up:remote`
8. CI auto-applies on push to `main` (see `.github/workflows/db-migrations.yml`)

Secrets needed in GitHub:

- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN`
- (Optional) `DATABASE_URL` if using direct PG auth

