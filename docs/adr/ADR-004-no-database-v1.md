# ADR-004: Use No Application Database in v1

**Status:** Accepted

## Context

The approved v1 is a statically published knowledge platform. Its content can be represented through structured Markdown/MDX collections, and no approved feature requires transactional application storage.

## Decision

Do not introduce an application database in v1. Store initial content in version-controlled Markdown/MDX and generate static output.

## Consequences

- Database operations, migrations, credentials, and runtime availability are not part of v1.
- Database-dependent features such as accounts, comments, and transactions remain deferred.
- A future database requires a demonstrated need, explicit approval, and a new accepted ADR.

## Alternatives Considered

- Add a database pre-emptively for future features: rejected as speculative complexity.
- Use a database-backed CMS from the start: rejected because a CMS is not approved for v1.
