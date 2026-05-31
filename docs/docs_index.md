# WedPass Documentation Index

## 1. Purpose

This document is the navigation guide for the **WedPass V1.0 documentation pack**.

It explains:

- What each document is for
- When Claude Code should read each document
- Recommended reading order
- Which documents control scope, architecture, implementation, UI, security, testing, deployment, and beta planning

WedPass is an offline-first wedding guest check-in and photo/video collection platform.

---

## 2. Recommended Claude Code Reading Order

When starting implementation, Claude Code should read the documents in this order:

```text
1. CLAUDE.md
2. README.md
3. v1_scope.md
4. prd.md
5. architecture.md
6. system_design.md
7. database_schema.md
8. api_contracts.md
9. offline_sync.md
10. security.md
11. routes.md
12. components.md
13. ui_ux.md
14. implementation_plan.md
15. testing_strategy.md
16. env_and_deployment.md
17. analytics_and_monitoring.md
18. risk_register.md
19. beta_plan.md
20. backlog.md
```

The most important file for Claude Code is:

```text
CLAUDE.md
```

It defines the coding rules and architectural guardrails.

---

## 3. Core Engineering Documents

## 3.1 `CLAUDE.md`

Purpose:

The engineering rulebook for Claude Code.

Use this document to control:

- Architecture rules
- Folder structure
- Coding standards
- Naming conventions
- DTO rules
- Service/repository separation
- Offline sync rules
- Security rules
- React component rules
- Anti-patterns

Claude Code should read this before every major coding task.

---

## 3.2 `README.md`

Purpose:

Project entry point for developers.

Use this document for:

- Project overview
- Tech stack summary
- Local setup guidance
- Folder structure overview
- Development workflow
- High-level product explanation

This should be the first human-facing document in the repository.

---

## 3.3 `v1_scope.md`

Purpose:

Frozen V1.0 scope.

Use this document to decide:

- What belongs in V1.0
- What must not be built yet
- What features are excluded
- What success criteria define V1 completion

This document protects the project from scope creep.

---

## 3.4 `prd.md`

Purpose:

Product requirements document.

Use this document for:

- Product vision
- Target users
- User problems
- Functional requirements
- Non-functional requirements
- Success metrics
- Product constraints

This is the product-level source of truth.

---

## 4. Architecture and System Design Documents

## 4.1 `architecture.md`

Purpose:

Technical architecture overview.

Use this document for:

- Overall architecture style
- Modular monolith decision
- TypeScript fullstack stack
- Offline-first architecture
- Storage architecture
- Security boundaries
- Scaling path

This document explains how the system is structured.

---

## 4.2 `system_design.md`

Purpose:

System behavior and operational design.

Use this document for:

- Core system components
- User flows
- Data flows
- Offline behavior
- Sync behavior
- Media upload behavior
- Failure handling
- Scalability assumptions

This document explains how the system behaves in real scenarios.

---

## 4.3 `database_schema.md`

Purpose:

Server and client database design.

Use this document for:

- PostgreSQL schema
- Prisma models
- IndexedDB/Dexie stores
- Relationships
- Indexes
- Constraints
- Snapshot data model
- Sync data model

Claude Code should use this when implementing Prisma, Dexie, repositories, migrations, and seed data.

---

## 4.4 `api_contracts.md`

Purpose:

Frontend/backend API contract.

Use this document for:

- API endpoints
- Request payloads
- Response payloads
- Error format
- Auth requirements
- Staff endpoints
- Sync endpoint
- Media upload flow
- Public guest endpoints

Claude Code should use this when implementing API route handlers, services, DTOs, and API clients.

---

## 4.5 `offline_sync.md`

Purpose:

Offline check-in and sync design.

Use this document for:

- Offline guest snapshot
- IndexedDB local guest store
- Local check-in queue
- Device ID
- Sync algorithm
- Conflict resolution
- Retry behavior
- Staff UI sync states
- Offline testing scenarios

This is one of the most important technical documents because offline check-in is WedPass’s core differentiator.

---

## 4.6 `security.md`

Purpose:

Security-by-design rules.

Use this document for:

- Authentication
- Authorization
- Staff tokens
- QR token security
- Media upload security
- API validation
- Rate limiting
- Local device security
- Infrastructure secrets
- Audit logging

Claude Code should use this whenever implementing auth, API routes, media upload, staff access, sync, or public endpoints.

---

## 5. Frontend and UX Documents

## 5.0 Design File

**WedPass Prototype (HTML):**

[WedPass Prototype](https://api.anthropic.com/v1/design/h/_SHtyNUR4OD5RI1lvQvGyw?open_file=WedPass+Prototype.html)

This is the interactive prototype for WedPass V1.0. Reference it when implementing any UI screen.

---

## 5.1 `ui_ux.md`

Purpose:

UI/UX design direction.

Use this document for:

- Visual direction
- Design system tokens
- Color palette
- Typography
- Button rules
- Screen inventory
- Staff mode UX
- Guest experience UX
- Organizer dashboard UX
- Claude Design prompts

Use this when designing or implementing screens.

---

## 5.2 `components.md`

Purpose:

Frontend component blueprint.

Use this document for:

- shadcn/ui components
- Product-specific components
- Component props
- Component responsibilities
- Component folder structure
- Build order
- Component anti-patterns

Use this when building reusable React components.

---

## 5.3 `routes.md`

Purpose:

Frontend and API route map.

Use this document for:

- Public routes
- Dashboard routes
- Staff routes
- Guest routes
- System routes
- API route paths
- Route guards
- Route-to-component mapping

Use this when creating Next.js App Router structure.

---

## 6. Implementation and Quality Documents

## 6.1 `implementation_plan.md`

Purpose:

Task-level build plan.

Use this document for:

- Implementation stages
- Build order
- Claude Code prompts
- Deliverables
- Definition of done
- Eight-week execution plan

Claude Code should use this document to know what to implement next.

---

## 6.2 `testing_strategy.md`

Purpose:

Testing and quality strategy.

Use this document for:

- Unit tests
- Component tests
- Integration tests
- API tests
- Offline tests
- E2E tests
- Security tests
- Performance tests
- Beta acceptance tests

Use this before marking any critical feature as done.

---

## 6.3 `env_and_deployment.md`

Purpose:

Environment and deployment setup.

Use this document for:

- Local environment setup
- `.env.example`
- Supabase PostgreSQL setup
- Cloudflare R2 setup
- Vercel deployment
- Sentry setup
- Deployment checklist
- Rollback strategy

Use this when preparing local development, staging, or production deployment.

---

## 6.4 `analytics_and_monitoring.md`

Purpose:

Product analytics and monitoring plan.

Use this document for:

- Product events
- Sync monitoring
- Media upload monitoring
- Sentry setup
- Security monitoring
- Beta reports
- Alert priorities

Use this when adding observability or preparing beta monitoring.

---

## 7. Product Operations Documents

## 7.1 `risk_register.md`

Purpose:

Risk management document.

Use this document for:

- Technical risks
- Product risks
- Security risks
- Beta risks
- Cost risks
- Mitigations
- Contingency plans
- Early warning signs

Review this before each beta wedding and before major releases.

---

## 7.2 `beta_plan.md`

Purpose:

Free beta rollout plan.

Use this document for:

- Beta goals
- Target beta users
- Wedding selection criteria
- Onboarding flow
- Event-day checklist
- Staff training
- Feedback collection
- Success criteria

Use this when onboarding the first real weddings.

---

## 7.3 `backlog.md`

Purpose:

Future feature parking lot.

Use this document for:

- V1.1 ideas
- Future product expansion
- AI features
- RSVP
- Invitation builder
- Social features
- Monetization
- Planner features

Use this to avoid scope creep during V1.0.

---

## 8. Documents by Development Task

## 8.1 Project Setup

Read:

```text
CLAUDE.md
README.md
implementation_plan.md
routes.md
components.md
env_and_deployment.md
```

---

## 8.2 Database and Prisma

Read:

```text
CLAUDE.md
database_schema.md
architecture.md
security.md
```

---

## 8.3 Authentication

Read:

```text
CLAUDE.md
api_contracts.md
security.md
database_schema.md
routes.md
```

---

## 8.4 Organizer Dashboard

Read:

```text
CLAUDE.md
prd.md
v1_scope.md
routes.md
components.md
ui_ux.md
api_contracts.md
```

---

## 8.5 Guest Management

Read:

```text
CLAUDE.md
database_schema.md
api_contracts.md
components.md
routes.md
testing_strategy.md
```

---

## 8.6 Event Mode

Read:

```text
CLAUDE.md
offline_sync.md
system_design.md
database_schema.md
api_contracts.md
security.md
```

---

## 8.7 Staff Offline Check-In

Read:

```text
CLAUDE.md
offline_sync.md
components.md
routes.md
ui_ux.md
testing_strategy.md
```

---

## 8.8 Sync Backend

Read:

```text
CLAUDE.md
offline_sync.md
api_contracts.md
database_schema.md
security.md
testing_strategy.md
analytics_and_monitoring.md
```

---

## 8.9 Media Upload

Read:

```text
CLAUDE.md
api_contracts.md
security.md
components.md
ui_ux.md
env_and_deployment.md
testing_strategy.md
```

---

## 8.10 Deployment

Read:

```text
CLAUDE.md
env_and_deployment.md
security.md
testing_strategy.md
analytics_and_monitoring.md
risk_register.md
```

---

## 8.11 Beta Launch

Read:

```text
beta_plan.md
risk_register.md
analytics_and_monitoring.md
testing_strategy.md
env_and_deployment.md
```

---

## 9. Recommended Repository Documentation Structure

Recommended folder:

```text
docs/
  README.md
  CLAUDE.md
  prd.md
  v1_scope.md
  architecture.md
  system_design.md
  database_schema.md
  api_contracts.md
  offline_sync.md
  security.md
  ui_ux.md
  components.md
  routes.md
  implementation_plan.md
  testing_strategy.md
  env_and_deployment.md
  analytics_and_monitoring.md
  risk_register.md
  beta_plan.md
  backlog.md
  docs_index.md
```

Alternative:

Keep `README.md` and `CLAUDE.md` at project root and place the rest in `/docs`.

Recommended:

```text
/README.md
/CLAUDE.md
/docs/*.md
```

---

## 10. Claude Code Working Rule

Before implementing any task, Claude Code should be instructed like this:

```text
Read CLAUDE.md and docs_index.md first.
Then read the specific documents relevant to the task.
Do not implement features outside v1_scope.md.
Follow implementation_plan.md for build order.
```

---

## 11. V1.0 Documentation Status

The current WedPass documentation pack includes:

```text
CLAUDE.md
README.md
prd.md
v1_scope.md
architecture.md
system_design.md
database_schema.md
api_contracts.md
offline_sync.md
security.md
ui_ux.md
components.md
routes.md
implementation_plan.md
testing_strategy.md
env_and_deployment.md
risk_register.md
beta_plan.md
backlog.md
analytics_and_monitoring.md
docs_index.md
```

---

## 12. Summary

The WedPass documentation pack is designed to make Claude Code productive without losing architectural discipline.

The key documents are:

- `CLAUDE.md` for engineering rules
- `v1_scope.md` for scope control
- `offline_sync.md` for the core differentiator
- `api_contracts.md` for frontend/backend alignment
- `database_schema.md` for data modeling
- `implementation_plan.md` for build order
- `testing_strategy.md` for reliability

The most important rule is:

> Build V1.0 exactly as scoped, validate it with real weddings, and move future ideas into the backlog.
