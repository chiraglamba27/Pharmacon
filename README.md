# Pharmacon

## GitHub Pages deployment

GitHub Pages hosts the Vite frontend only. The Express backend must be deployed separately and exposed over HTTPS, while Supabase remains the authentication and database service.

1. In the repository settings, open **Pages** and set **Source** to **GitHub Actions**.
2. In **Settings > Secrets and variables > Actions**, add these repository variables:
   - `VITE_API_BASE_URL`: the public HTTPS URL of the deployed backend, without a trailing slash
   - `VITE_SUPABASE_URL`: the Supabase project URL
3. Add this repository secret:
   - `VITE_SUPABASE_ANON_KEY`: the Supabase anonymous key
4. Push to `main`, or run **Deploy frontend to GitHub Pages** from the Actions tab.

The deployed frontend URL is `https://chiraglamba27.github.io/Pharmacon/`.