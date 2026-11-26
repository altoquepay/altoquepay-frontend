# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.1] - 2026-11-26

### Fixed
- **Customers**: the payment day only accepts 1 to 28, as the API does, and its error names the payment day instead of the cut-off day.
- **Customers**: the credit limit and the rates only accept numbers with a decimal point (2 decimals for amounts, 7 for rates), so values such as `1500,50` or `75%` no longer reach the API.
- **Core**: API validation errors are shown in Spanish with the name of the field, instead of the API's English message.
- **Credit**: the quantity of a new purchase shows the quantity that will be registered after typing a value below 1 or above 10 000.
- **IAM and Stores**: sign up and forgot password require an email with a dot in its domain, as the API does.
- **Billing and Credit**: the payment and purchase lists warn when the end date is before the start date instead of showing an empty list.
- **Billing**: *Registrar pago* only quotes whole ids greater than zero.

## [0.4.0] - 2026-11-26

### Added
- **Catalog**: *Volver a vender* on the page of an inactive product reactivates it with `PATCH /products/{id}/reactivate` (backend `0.8.0`).
- **Customers**: *Reactivar* on the page of an inactive customer account lets it buy on credit again, with its current terms, through `PATCH /customers/{id}/reactivate` (backend `0.8.0`).
- **Support**: public *Ayuda y soporte* page (`/help`) with frequent questions and the support email, linked from sign in, access-code activation and the user menu.

### Fixed
- **Customers and Stores**: the phone is required and only accepts the 9 digits of a mobile number, or +51 followed by them. Letters or symbols show *Solo se aceptan números* and the form cannot be saved.

## [0.3.0] - 2026-11-20

### Added
- **Design system**: tokens, typography (Plus Jakarta Sans) and SCSS partials (`src/styles/`) taken from the UI mockups, the `Icon` component with the app's line icons and the AlToque Pay logo in `public/images/logo.png`.
- **Billing**: payments and late-payment screen (`/store/payments`) with today's figures, the obligations to collect (weekly installments and closed statements), a detail panel with today's quote and the payment registration, and a WhatsApp reminder link. The payment list moved to `/store/payments/history`.
- **IAM**: *Recordarme* on sign in keeps the session in `localStorage`; without it the session lives in `sessionStorage`. Password fields can show or hide the password.

### Changed
- **Layout**: dark sidebar with the logo and the mockup menu, and a top bar with the store, the overdue bell and the user menu.
- **IAM and Stores**: sign in and sign up follow the split-card mockups. Sign up asks for first and last names, business name, RUC, email, password, confirmation and terms.
- **Reporting**: dashboard redesigned as *Panel principal* with tinted figures, upcoming due dates, quick actions and alerts.
- **Customers**: customer list with figures and the credit conditions of the selected customer editable on the same screen.
- **Credit**: new credit purchase screen with purchase information, payment conditions and a live summary that simulates on every change; purchase detail redesigned as *Estado de cuenta / Plan de pagos*.
- **Stores**: store profile redesigned as *Perfil del negocio* with business information, preferences and security.
- **Shared**: numbered pager, status pills (*Pagado*, *Próxima*, *Pendiente*, *Vencido*) and error alerts with icons.

## [0.2.0] - 2026-11-19

### Added
- **Core**: API error handling with a Spanish message for every backend `code`, the `authInterceptor` (Bearer token, sign-out on `401`, `PASSWORD_CHANGE_REQUIRED` and `STORE_INACTIVE`) and the `authGuard`, `sessionGuard`, `guestGuard` and `roleGuard` route guards.
- **IAM**: sign in with email or DNI as a form, forgot and reset password, required and voluntary password change, and customer access-code activation.
- **Stores**: public store registration, store profile with default credit conditions validated against the BCRP cap, and store administration for the system administrator.
- **Customers**: customer list, DNI lookup, account opening with the one-time access code, account detail and edit, deactivation, new access codes and trusted store.
- **Catalog**: product list, create, edit, deactivate and image upload.
- **Credit**: credit sale with simulation before registering, purchase list and detail, weekly schedule, voiding and installment list.
- **Billing**: cycle list, account statement with PDF download, payment quote and registration, and payment list.
- **Reporting**: store dashboard, period report and the customer portal.
- **Regulation**: BCRP rate caps list and registration.
- **Layout**: shell with a side menu for each role, shared pager, badges, toasts and format pipes (`soles`, `pct`, `label`, `fecha`, `mes`).
- **Environments**: development and production API URLs, and a `team-server` configuration to run locally against the team server.

## [0.1.0] - 2026-10-20

### Added
- **Angular Project Scaffold**: Generated the Angular 22 application with standalone components, SCSS styles and Angular Router, including the default build, test and editor configuration (`angular.json`, `tsconfig*`, `.editorconfig`, `.prettierrc`).
- **Project Documentation**: Added `README.md` describing the AlToquePay product, planned features, business rules, legal framework, tech stack, development workflow and team.
- **Licensing**: Added `LICENSE.md` under the MIT License.
- **Changelog**: Added this changelog following the Keep a Changelog format.
