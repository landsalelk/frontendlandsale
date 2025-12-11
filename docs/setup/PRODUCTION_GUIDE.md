# 🚀 LandSale.lk Production Deployment Guide

Your application is **Production Ready** from a code perspective. The core features, UI/UX enhancements, and security measures (like authenticated routes) are all implemented.

To successfully connect `landsale.lk` and go live, follow these specific steps:

## 1. Environment Configuration
When deploying to your hosting provider (Vercel, Netlify, VPS, etc.), you **MUST** set these environment variables:

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SITE_URL` | `https://landsale.lk` | Used for SEO, OG images, and email redirects. |
| `NEXT_PUBLIC_SUPABASE_URL` | *(Your Supabase Project URL)* | Connects to your backend. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Your Supabase Anon Key)* | Client-side API access. |
| `RESEND_API_KEY` | *(Your Resend API Key)* | Sending inquiry notifications. |
| `EMAIL_FROM` | `noreply@landsale.lk` | Sender address for emails. |

## 2. Supabase Configuration (Critical)
Log in to your Supabase Dashboard and update these settings to avoid login errors:

1.  Go to **Authentication** > **URL Configuration**.
2.  **Site URL**: Set to `https://landsale.lk`.
3.  **Redirect URLs**: Add the following:
    - `https://landsale.lk/**`
    - `https://landsale.lk/auth/callback`
    - `https://landsale.lk/dashboard/reset-password`

## 3. Domain & DNS Settings
1.  **Hosting Provider**: Add the custom domain `landsale.lk`.
2.  **DNS Provider (Registrar)**:
    - Add the **A Record** (for root domain `@`) provided by your host.
    - Add the **CNAME Record** (for `www`) if required.
3.  **Resend (Email)**:
    - Go to [Resend Domains](https://resend.com/domains).
    - Add `landsale.lk`.
    - Add the provided **MX** and **TXT** records to your DNS to verify sender identity.

## 4. Final Sanity Checks
- [ ] **robots.txt**: Automatically generated, but ensure your hosting doesn't block bots by default (e.g., Vercel's "Preview" environments block indexing).
- [ ] **Database**: Ensure your production database has the `inquiries` and `property_views` tables created (run `src/lib/supabase/db-schema.sql` if starting fresh).
- [ ] **Storage**: Ensure your Supabase Storage buckets (`properties`, `avatars`) are public or have correct policies.

## 5. Troubleshooting Common Issues
- **404 on Refresh**: If hosting on a VPS/Nginx, ensure you configure it to route all requests to `index.html` (SPA fallback) or properly proxy to the Next.js server port. Vercel handles this automatically.
- **Images not loading**: Check `next.config.ts`. We have allowed `images.unsplash.com` and `*.supabase.co`. If using another source, add it there.
- **Login Redirects to localhost**: You forgot to update `NEXT_PUBLIC_SITE_URL` or Supabase Auth settings.

## 🚀 You are ready for launch!
The application build is passing with 0 errors and all critical UI/UX issues from the audit have been resolved.
