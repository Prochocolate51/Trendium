# ExplainItSimple

ExplainItSimple rewrites difficult text into student-friendly learning outputs:

1. **Simple Explanation**
2. **Key Points**
3. **Example**
4. **Quick Recap**

## Why the PR preview may not be clickable

If you are looking at the screenshot artifact in the PR, that image is **static** and not interactive.
To use the app, run the Next.js server locally (or on a deployed URL) and open it in your browser.

## Quick start

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy `.env.example` to `.env` and add your OpenAI key:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
OPENAI_API_KEY=your_real_openai_api_key
```

### 3) Start the app

```bash
npm run dev
```

Open: `http://localhost:3000`

## How to use

1. Paste text into the large textarea (minimum **50 characters**).
2. Choose a tone from the dropdown.
3. Click **Simplify**.
4. Read the four output sections.
5. Click **Copy all** to copy the full generated output.

## Build for production

```bash
npm run build
npm run start
```

## Notes

- API endpoint: `POST /api/simplify`
- Includes basic in-memory rate limiting to reduce spam.
- For multi-instance production deployments, replace in-memory rate limiting with a shared store (e.g., Redis).
