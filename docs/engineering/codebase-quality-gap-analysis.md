# Executive Summary

This audit assesses the engineering maturity, architecture, and maintainability of the Radio Station SaaS codebase. The application currently functions as a Minimum Viable Product (MVP) but falls short of enterprise-grade engineering standards necessary for production scaling, external due diligence, and team handover.

While core features (authentication, multi-tenancy via Prisma, MediaCP integration) are functional, the codebase suffers from severe architectural bleeding. Specifically, business logic is heavily entangled within Express route handlers, the administrative frontend is tightly coupled to the backend repository instead of being isolated, and there is a lack of rigorous module boundaries (DTOs, Services, Controllers, and Repositories). To pass enterprise due diligence, the application must be refactored into a layered architecture with clear separation of concerns.

# Scoring (0-100)

- **Overall Engineering Maturity:** 45/100
- **Code Quality:** 50/100 (Inconsistent error handling, massive route files)
- **Architecture:** 40/100 (Missing Controller/Service/Repository separation; mixed frontend/backend)
- **Directory Structure:** 35/100 (Frontend code in backend directory, missing standard domain layers)
- **Module Boundary:** 30/100 (Business rules leak into routes)
- **API Design:** 55/100 (RESTful but lacks OpenAPI specs, pagination, and unified error wrappers)
- **Database Design:** 70/100 (Prisma schema is reasonably well-structured with tenant scoping)
- **Documentation:** 20/100 (Missing comprehensive Swagger, inline docs, and onboarding guides)
- **Testability:** 30/100 (Hard to unit test due to monolithic route handlers and tight Prisma coupling)
- **Maintainability:** 40/100 (High risk of regressions during feature addition)

# Critical Issues

1. **Frontend / Backend Coupling**: The frontend UI (Vanilla JS, `admin/app.js`, `admin/core.js`) is stored directly inside the backend source tree instead of a dedicated frontend project (`/frontend` or `/src` with a modern bundler like Vite/React/Vue).
2. **Missing Service Layer**: Express routes (e.g., `routes/auth.js`, `routes/plans.js`, `routes/mediacp.js`) contain raw database queries (`prisma.x.find...`) mixed with business logic and HTTP request handling. This violates the Single Responsibility Principle and makes unit testing impossible without full integration setups.
3. **Mega Routes**: Route files are functioning as "God objects", handling validation, business logic, external API calls, and persistence.
4. **RBAC Flaws**: Role creation during Tenant registration arbitrarily assigns `ALL_PERMISSIONS`, creating security risks if new permissions are added.

# High-Priority Issues

1. **API Consistency**: Missing a unified error/response payload envelope (DTOs/Schemas). Validation is ad-hoc (`safeObject()`) instead of using robust validation libraries (like Zod or Joi).
2. **Missing DTO / Schema Validation**: Incoming payloads are not strictly typed or validated, leaving the application vulnerable to bad data states.
3. **Missing Automated Tests**: Aside from a single `mobileApi.test.js`, the core provisioning and billing engines lack unit and integration tests.

# Medium/Low-Priority Issues

- **Directory Pollution**: The backend root contains raw scripts (`temp.js`, `check_global.js`) that should be moved to a `scripts/` or `tools/` directory.
- **Missing Pagination**: List endpoints do not implement robust offset or cursor-based pagination.
- **Documentation**: Missing OpenAPI/Swagger specs for API partners.

---

# Refactor Roadmap

To elevate this codebase to an enterprise standard without breaking existing functionality, the following phased roadmap is proposed:

### Phase 1: Directory Structure & Boundary Establishment (Backend)
- Implement a **3-Tier Architecture**: Controllers, Services, and Repositories.
- Create `/backend/src/controllers`, `/backend/src/services`, and `/backend/src/validations`.
- Move raw database queries from Express routes into dedicated Service classes/functions.
- Introduce **Zod** or **Joi** for strict request body validation (DTOs).

### Phase 2: Frontend Decoupling
- Extract the `backend/admin` directory into a standalone `/frontend` architecture.
- Since it is Vanilla JS, establish a `/frontend/src` directory with `/components`, `/pages`, `/services` (for API calls), and `/styles`.
- Remove the reliance on serving the frontend directly from Express, enabling standard frontend build pipelines (e.g., Vite).

### Phase 3: Security & RBAC Hardening
- Refactor `lib/permissions.js` and `auth.js` to use predefined Role templates rather than dynamic `ALL_PERMISSIONS` arrays that risk granting super-admin rights to tenant owners.
- Ensure all API endpoints uniformly apply the `requirePermission` guard with proper tenant-scoping validations.

### Phase 4: API Standardization & Documentation
- Implement a global error-handling middleware to normalize all HTTP responses to a standard `{ ok, data, error, meta }` shape.
- Document all core endpoints using Swagger / OpenAPI comments.

### Phase 5: Testability & CI/CD
- Write unit tests for the newly isolated Service layer (mocking Prisma).
- Set up GitHub Actions (or equivalent) for continuous integration, linting, and testing.

---

# Implementation Strategy
The refactoring will be executed incrementally. The backend will be restructured first by wrapping existing route logic into service modules, ensuring that the external API contract remains 100% identical so the frontend does not break. Once the backend architecture is stabilized, the frontend will be reorganized into standard domain modules.
