## Environment variables

Copy `.env.example` to `.env.local` and set values for your environment:

```env
BACKEND_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_replace_with_your_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
OPENAI_API_KEY=your-openai-api-key
# Optional; defaults to gpt-4o-mini
OPENAI_MODEL=gpt-4o-mini
```

The frontend sends API requests through its own `/api/backend` route, which
forwards them to the backend and avoids browser CORS restrictions. Set
`BACKEND_API_URL` to your deployed backend API URL in the Vercel project's
Environment Variables for each deployment environment, then redeploy.

Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to the OAuth 2.0 Web client ID from Google
Cloud Console. The frontend sends the resulting Google ID token to the
backend's `POST /auth/google` endpoint as `{ "idToken": "..." }`; the backend
must verify the token and return the standard auth response
(`accessToken`, `refreshToken`, and `user`). Keep the Google client secret on
the backend, never in frontend environment variables.

The GearUp support assistant and personalized content suggestions use the
server-side OpenAI Responses API. Set `OPENAI_API_KEY` in `.env.local` for local
development and in the deployment environment for production; never prefix it
with `NEXT_PUBLIC_`. `OPENAI_MODEL` is optional. Chat messages are sent to
OpenAI when a user submits them. Search interests are sent only when a user
requests personalized content suggestions. No email/newsletter provider is
currently configured, so digest recommendations are displayed in the app and
are not emailed.
