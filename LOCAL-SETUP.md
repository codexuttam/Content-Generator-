Local development notes — keep secrets out of source control

1) Local API key file (recommended)

 - Copy `src/app/environments/environment.local.ts` to the same path (or edit that file directly)
 - Paste your Gemini/Generative API key into the `GEMINI_API_KEY` field.
 - The repo's `.gitignore` already excludes `src/app/environments/environment.local.ts` so it won't be committed.

Example (do not paste your key here):

```ts
export const environment = {
  production: false,
  GEMINI_API_KEY: 'YOUR_REAL_KEY_HERE'
};
```

2) Using the key locally

 - For quick testing you can copy the key into `src/app/environments/environment.ts` temporarily, but be careful not to commit it.
 - Better: keep `environment.local.ts` with your key and manually ensure your build uses it for local runs (or copy it into `environment.ts` only on your machine).

3) Security & rotation

 - If the key has been exposed publicly (for example, in a screenshot you shared), rotate/delete it in Google Cloud Console immediately and create a new key.
 - Restrict the key in Google Cloud Console to only the Generative API and, where possible, restrict by IP or HTTP referrer.

4) Production

 - Never embed API keys in client-side bundles for production. Create a backend proxy that stores the key in an environment variable or a secret manager and forwards requests.
