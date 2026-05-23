# NovaCloud SaaS Architecture

NovaCloud is a multi-tenant SaaS application that allows users to seamlessly spin up and manage radio and TV streaming services powered by MediaCP.

## Core Components

1. **Express & Prisma API Backend**: The primary Node.js service managing tenants, subscriptions, authentication, and platform configurations.
2. **PostgreSQL Database**: The relational database used to store users, tenants, plans, feature flags, payments, and MediaCP mappings.
3. **BullMQ Worker Queue (Redis)**: Background job processing engine that handles provisioning workflows, payment verifications, and potentially email notifications to ensure reliability and replayability.
4. **MediaCP API Integration**: A REST adapter communicating with the upstream MediaCP instance (e.g., Icecast2, Flussonic) to dynamically allocate listener slots, bitrates, and streaming endpoints.
5. **Billing Gateways**: Integrated with Paystack and Flutterwave, supporting regional and global payments. Webhooks enqueue jobs for idempotency.
6. **Mobile Configuration API**: A public REST API layer allowing standalone Android companion apps to dynamically fetch their branding (logos, colors), content structures, feature flags (chat, podcasts), and streaming URLs using a `tenantSlug`.

## Deployment Requirements

- **Node.js** >= 18.x
- **PostgreSQL** >= 14
- **Redis** >= 6.x
- **Storage**: S3-compatible object storage (e.g., AWS S3, DigitalOcean Spaces) for production app assets, or local disk for dev (`/uploads`).
- **Payment Gateways**: Accounts configured with Webhook URLs pointing to `/api/billing/webhooks/{provider}`.

## Queueing Strategy

Instead of inline API provisioning, NovaCloud uses BullMQ. 
1. **Billing Worker**: Validates `charge.success` from Paystack/Flutterwave, marks invoices as paid, and triggers a provisioning job.
2. **Provisioning Worker**: Connects to MediaCP via REST, sets up the server, updates Prisma `MediaCpService` maps, and sends a welcome email to the tenant.

## Local Development
1. Setup PostgreSQL and Redis.
2. Copy `.env.example` to `.env` and fill variables.
3. Run `npm install`.
4. Run `npx prisma db push`.
5. Run `npm run dev`.
6. Use `npx jest` to run the mobile API test suite.
