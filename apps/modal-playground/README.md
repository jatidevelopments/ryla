# Endpoint Playground

Minimal app to test and compare **Modal** and **RunComfy** endpoints with the same prompt, side by side. Use the provider selector at the top to switch between Modal and RunComfy.

## Run locally

1. **API** must be running:

   - **Modal**: set `MODAL_WORKSPACE` or `MODAL_ENDPOINT_URL`.
   - **RunComfy**: set `RUNCOMFY_API_TOKEN` (from [RunComfy Profile](https://www.runcomfy.com/profile)).

   ```bash
   infisical run --path=/apps/api --path=/shared --env=dev -- pnpm nx serve api
   ```

2. **Playground** (from repo root):

   - **RunComfy**: Start the API with Infisical so it gets `RUNCOMFY_API_TOKEN`, then the playground:
     ```bash
     pnpm dev:playground-with-api
     ```
     This runs both the API (with Infisical secrets) and the playground. API at 3001, playground at 3005.
   - **Modal only**: If the API is already running with Infisical elsewhere:
     ```bash
     pnpm dev:playground
     ```

   Playground opens at [http://localhost:3005](http://localhost:3005).

3. If the API is not on `http://localhost:3001`, set the URL when starting the playground (used by the server-side proxy):

   ```bash
   API_URL=http://localhost:3001 pnpm nx serve modal-playground
   ```

## Usage

- **Provider**: Switch between **Modal** and **RunComfy** at the top. RunComfy shows deployments from your account (requires `RUNCOMFY_API_TOKEN` on the API).
- Choose a **preset prompt** (character, influencer, realistic) or enter a custom prompt.
- Select one or more **endpoints** (Modal: predefined list; RunComfy: your deployments).
- Click **Run** to call each selected endpoint with the same prompt and seed.
- Results appear side by side with time (and cost for Modal when returned).

## Presets

| Preset              | Description                    |
| ------------------- | ------------------------------ |
| Character portrait  | Soft portrait, photorealistic  |
| Influencer / social | Café lifestyle, candid         |
| Realistic product   | Product shot, white background |

## Spec

- Initiative: [IN-036](../../docs/initiatives/IN-036-modal-endpoint-testing-playground.md)
- App spec: [MODAL-PLAYGROUND-APP-SPEC](../../docs/specs/modal/MODAL-PLAYGROUND-APP-SPEC.md)
