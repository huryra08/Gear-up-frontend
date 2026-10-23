BACKEND_API_URL=https://huryra-backend.vercel.app/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_replace_with_your_key

The frontend sends API requests through its own `/api/backend` route, which
forwards them to the backend and avoids browser CORS restrictions. Set
`BACKEND_API_URL` to `https://huryra-backend.vercel.app/api` in the Vercel
project's Environment Variables for each deployment environment, then redeploy.
