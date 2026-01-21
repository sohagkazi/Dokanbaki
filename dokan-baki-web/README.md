This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new).

### One-Click Deploy

Use the button below to deploy this project to Vercel. It will prompt you to set the required environment variables.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsohagkazi%2FDokanbaki&env=MONGODB_URI,NEXT_PUBLIC_APP_URL,NEXT_PUBLIC_FIREBASE_PROJECT_ID,GCLOUD_PROJECT,FIREBASE_CLIENT_EMAIL,FIREBASE_PRIVATE_KEY,MOYNAPAY_API_KEY,PIPRAPAY_API_KEY)

### Environment Variables

You will need to configure the following environment variables in your Vercel project settings (referenced in `.env.example`):

- `MONGODB_URI`: Your MongoDB connection string.
- `NEXT_PUBLIC_APP_URL`: Your production URL (e.g., `https://dokan-baki.vercel.app`).
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID.
- `GCLOUD_PROJECT`: Same as Firebase project ID.
- `FIREBASE_CLIENT_EMAIL`: Service account email for Firebase Admin.
- `FIREBASE_PRIVATE_KEY`: Service account private key for Firebase Admin.
- `MOYNAPAY_API_KEY` / `PIPRAPAY_API_KEY`: Payment gateway keys (if using).
