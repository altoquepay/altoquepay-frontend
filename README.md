# altoquepay-frontend

Web frontend of **AlToquePay**, a web application for small neighborhood businesses (corner stores, bakeries, butcher shops, hair salons and similar) to manage the credit they grant to their customers. It replaces the paper notebook with a digital, automated record of customers, credit purchases, payment schedules and late payments.

> **Status:** early development (`0.x`). Only the Angular project scaffold exists so far. The features below describe the planned scope, taken from the project report.

## Overview

In Peru, selling on credit ("fiado") is common in small businesses, but it is usually tracked on paper. Interest is often not calculated for the time elapsed and late payments are not tracked, so merchants lose profitability. AlToquePay digitalizes that relationship while applying rigorous financial calculations.

## Planned features

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

## Tech stack

- Angular 22 (standalone components, SCSS, routing)
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
