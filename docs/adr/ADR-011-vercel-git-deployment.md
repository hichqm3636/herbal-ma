# ADR-011: Use Vercel Git-Based Static Deployment

**Status:** Accepted

Human merge of the reviewed pull request that introduces this ADR is approval of ADR-011.

## Context

ARCHITECTURE.md already named Vercel as the intended host, but the deployment mechanism, branch rules, CI behavior, and Vercel configuration were deferred. The project is now a completed static Astro content site with bilingual public pages and static Search. The repository needs a Preview and Production workflow that preserves static output, editorial approval, and hostname control.

## Decision

- Vercel is the production host.
- Deploy the static `dist/` directory. Do not add an Astro Vercel adapter.
- Use Vercel Git integration as the deployment mechanism.
- Pull requests and branches receive Preview deployments.
- `main` is the Production branch.
- Repository CI validates only and never deploys.
- The canonical production host remains `https://herbal.ma`.
- `https://www.herbal.ma/*` should permanently redirect to `https://herbal.ma/*` once domain cutover occurs.
- DNS and domain cutover is a separate human-approved operational action. A successful Vercel deployment does not authorize cutover.

## Consequences

- Vercel account and project configuration are required in Phase 12C. This ADR records approved architecture; it does not claim that configuration already exists.
- After Git integration is enabled, merging to `main` will trigger Production.
- Application rollback can use a previous Vercel Production deployment or a Git revert. DNS rollback remains a separate restore of recorded pre-cutover values.
- The project remains portable because production output is static `dist/`.
- No serverless functions, deployment environment variables, application server, or database are introduced.

## Alternatives Considered

- **Cloudflare Pages:** rejected for now. It can host static `dist/`, but Vercel was already the intended host and Git Preview/Production on Vercel matches the needed workflow without a new provider decision.
- **GitHub Pages:** rejected. It is less aligned with PR Preview review and with the already-intended Vercel host.
- **Manual uploads of `dist/`:** rejected. They are error-prone and do not give a durable Preview/Production branch workflow.
- **Deployment from GitHub Actions:** rejected. Repository CI must remain a validation gate. Mixing deploy credentials into GitHub Actions would add secrets and a second deploy path the project does not need.
