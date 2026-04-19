# Contributing to XIMVERSE

We welcome contributions — especially from exporters who know what the paperwork actually looks like.

## Who Should Contribute

- **Exporters** — if our OCR parser misses a field in your real document, open an issue with the OCR text (redact sensitive data)
- **Developers** — if you know CBEC document formats, ICEGATE integration, or Indian trade compliance
- **Designers** — the dashboard is functional but not beautiful; UX improvements welcome
- **Translators** — our target users speak Hindi, Gujarati, Tamil. i18n contributions are high priority

## Getting Started

```bash
git clone https://github.com/ashutoshrai7205/XimVerse.git
cd XimVerse
npm install
cp .env.example .env.local   # fill in Supabase + OCR.space keys
npm run dev                  # → http://localhost:3000
```

## Running Tests

```bash
npm test          # run all 21 unit tests
npm run type-check  # TypeScript validation
```

All PRs must pass `npm test` and `npm run type-check` before merge. Our CI runs both automatically.

## What to Work On

Check [open issues](https://github.com/ashutoshrai7205/XimVerse/issues) — especially those tagged `good first issue` or `help wanted`.

High-priority areas:
- **More document templates** — Certificate of Origin, Shipping Bill, GST Invoice
- **OCR parser edge cases** — different invoice layouts from different CHAs
- **Mobile responsiveness** — Tier-2/3 city exporters are mobile-first
- **i18n** — Hindi UI would unlock a much larger audience

## Pull Request Process

1. Fork → feature branch (`feat/your-feature`) → PR against `main`
2. Fill in the PR template — especially the testing checklist
3. Keep PRs focused. One concern per PR.
4. Don't add abstractions the codebase doesn't need yet.

## Code Style

- TypeScript strict mode — no `any` unless genuinely unavoidable
- No comments explaining *what* the code does — only *why* (surprising constraints, workarounds)
- No new dependencies without discussion in an issue first
- Regex parser changes must come with a test case (`lib/__tests__/parseOcrText.test.ts`)

## Reporting OCR Failures

If the parser extracts wrong data from your document:

1. Run the document through the demo at [ximverse.vercel.app](https://ximverse.vercel.app)
2. Open browser DevTools → Network → find the OCR response
3. Copy the `ParsedText` from the response
4. Open an issue with: the raw OCR text (redacted), what was extracted, what was expected

This is the fastest way to improve accuracy for real-world documents.

## License

By contributing, you agree your contributions are licensed under [MIT](LICENSE).
