# altoquepay-frontend

Web frontend of **AlToquePay**, a web application for small neighborhood businesses (corner stores, bakeries, butcher shops, hair salons and similar) to manage the credit they grant to their customers. It replaces the paper notebook with a digital, automated record of customers, credit purchases, payment schedules and late payments.

> **Status:** early development (`0.x`). Every screen of the first release is built on top of [altoquepay-backend](https://github.com/altoquepay/altoquepay-backend) API `0.9.1`, covering its 54 endpoints. The UI is in Spanish. Deployed at https://altoquepay-frontend.web.app.

## Overview

In Peru, selling on credit ("fiado") is common in small businesses, but it is usually tracked on paper. Interest is often not calculated for the time elapsed and late payments are not tracked, so merchants lose profitability. AlToquePay digitalizes that relationship while applying rigorous financial calculations.

## Features

- **Business profile and preferences:** default currency (PEN), cut-off day, payment day, rate type, default rates and maximum number of installments.
- **Customer management:** customers with a credit line, available credit and individual credit conditions.
- **Credit purchases:** register purchases with a payment modality and see the financed amount, estimated interest and installment before saving.
- **Payment plan and account statement:** installment schedule with opening balance, interest, amortization, installment and closing balance.
- **Payments and late payments:** pending and overdue obligations, days late and late-payment interest.
- **Dashboard and reports:** active customers and credits, amount to collect, overdue payments and upcoming due dates.

## Payment modalities

- **Fixed date:** the customer pays purchases made before the cut-off date in a single payment. Ordinary interest is calculated on the elapsed days.
- **Weekly installments:** the purchase is split into equal weekly installments using the ordinary simple arrears French method. Purchases made before the cut-off date have a total grace period whose interest is capitalized before the schedule is calculated.

## Business rules

| Rule | Definition |
| --- | --- |
| Commercial year | 360 days |
| Installment period | 7 days |
| Cut-off day | 1 to 25 |
| Payment day | 1 to 28, after the cut-off day |
| Currency | Soles (PEN) |
| Rate precision | At least 7 decimals; monetary values with 2 decimals |
| Payment application order | Late-payment interest, ordinary interest, principal |

Rates may be entered as nominal (TNA) or effective (TEA). The system always works internally with an effective annual rate (TEA):

```text
TEA  = (1 + TNA / m)^m - 1          m = capitalization periods per year
TEP  = (1 + TEA)^(days / 360) - 1   effective rate for a period of `days`
TE7d = (1 + TEA)^(7 / 360) - 1      rate for the weekly installments

Sg = S0 * (1 + TEA)^(g / 360)       balance after a total grace period of g days
R  = P * i(1 + i)^n / ((1 + i)^n - 1)   constant installment (French method), i = TE7d
```

Late-payment interest is calculated on the overdue amount using the late-payment rate over the days late. The maximum conventional rates are set by the Central Reserve Bank of Peru (BCRP) and change over time, so they must be configurable parameters, not constants.

## Legal framework

- Consumer Protection and Defense Code (Law No. 29571)
- Peruvian Civil Code (compensatory and late-payment interest)
- Personal Data Protection Law (Law No. 29733) and its regulation (Supreme Decree No. 016-2024-JUS)
- BCRP maximum conventional interest rates

## Roles and screens

| Role | Screens |
| --- | --- |
| Public | Sign in (email or DNI), store registration, forgot and reset password (`/reset-password?token=…`), customer access-code activation (`/activate`), help and support (`/help`) |
| `STORE_ADMIN` | Dashboard, store profile and default credit conditions, customers (DNI lookup, account opening with access code, edit, deactivate, reactivate, new access code), products (with image upload, deactivate and reactivate), new credit sale (simulate, then register), purchases (detail, schedule, void), installments, cycles and account statements (with PDF), payments (quote, then register) and period report |
| `CUSTOMER` | Customer portal: linked stores, available credit, pending installments, purchases and their schedules, monthly statements, link another store with a code |
| `SYSTEM_ADMIN` | Stores (deactivate, reactivate), BCRP rate caps and trusted store for a customer |

Every signed-in user can change their password and open *Ayuda y soporte* from the user menu. When `must_change_password` is `true`, the app sends the user to that screen first.

## Design

The UI follows the team mockups: a dark sidebar with the logo, white cards on a light background and the teal brand color (`#1AC2AE`). The design tokens live in `src/styles/_tokens.scss`, and the shared styles in the other partials of `src/styles/`. Icons are drawn by the `Icon` component (`<app-icon name="users" />`). The logo in `public/images/logo.png` was cut out of the mockups; replace it with the original file for a sharper image.

## Project structure

The `src/app` folders follow the bounded contexts of the backend:

```text
src/app/
  core/          errors (API error codes in Spanish), guards and the auth interceptor
  shared/        components (icon, pager, badge, error alert, toasts, schedule table), pipes, models, services and utils
  layout/        shell with the side menu for each role
  iam/           sign in, passwords and access codes; AuthService
  stores/        store registration, profile and administration
  customers/     customer accounts, access codes and trusted store
  catalog/       products and their images
  credit/        credit purchases and weekly installments
  billing/       cycles, account statements and payments
  reporting/     dashboard, period report and customer portal
  regulation/    BCRP rate caps
  support/       help and support page
```

Each context has `model/` (API resources), `services/` (one service per API area) and `pages/` (routed screens: `name.page.ts`, `name.page.html`, `name.page.scss`). Routes are lazy loaded from `app.routes.ts`.

## API

| Environment | File | API base URL |
| --- | --- | --- |
| Development (`npm start`) | `src/environments/environment.development.ts` | `http://localhost:8000/api/v1` |
| Production (`npm run build`) | `src/environments/environment.ts` | `https://altoquepay.duckdns.org/api/v1` |

To run the frontend locally against the team server, use `npx ng serve --configuration team-server`.

- The sign-in screen shows whether `GET /health` answers. If it says *sin conexión* while the backend is running, check CORS.
- Before the first credit sale, the system administrator (`FIRST_ADMIN_EMAIL` in the backend `.env`) must register the BCRP cap in force; otherwise purchases answer `NO_BCRP_CAP_IN_FORCE`.

## Tech stack

- Angular 22 (standalone components, signals, zoneless change detection, SCSS, routing)
- Template-driven forms and `HttpClient` with a functional interceptor
- Vitest for unit tests
- TypeScript
- npm

## Getting started

Prerequisites: Node.js and npm.

```bash
npm install
npm start
```

The app is served at `http://localhost:4200/` and reloads on file changes.

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm start`     | Start the development server |
| `npm run build` | Create a production build    |
| `npm test`      | Run the unit tests           |

## Deployment

The app is hosted on Firebase Hosting at `https://altoquepay-frontend.web.app`, and GitHub Actions run two workflows:

- `ci.yml` runs `npm ci`, the unit tests and the production build on every pull request and push to `develop` and `main`.
- `deploy.yml` runs when a `vX.Y.Z` tag is pushed. It deploys only a tag on `main` whose version matches `package.json`: it tests, builds and deploys to the live channel.

## Workflow

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- **Branching:** [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`)
- **Versioning:** [Semantic Versioning](https://semver.org/)

## Team

Group 5, section 7707. Finanzas e Ingeniería Económica, Universidad Peruana de Ciencias Aplicadas (UPC), 2026-20.

- Thomas Percy Nazhir Bernardo Remuzgo
- Dyron Huapaya Galindo
- Katherine Naomi Meza Tupayachi
- Keith Bryan Torres Yzquierdo
- Adrian Alonso Quiroz Caceres

**Startup:** AlToquePay

## Changelog

Notable changes are documented in [CHANGELOG.md](CHANGELOG.md).

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md).
