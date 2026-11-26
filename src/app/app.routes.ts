import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard, sessionGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // ---------- Públicas (iam, stores) ----------
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./iam/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./stores/pages/register-store/register-store.page').then((m) => m.RegisterStorePage),
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./iam/pages/forgot-password/forgot-password.page').then((m) => m.ForgotPasswordPage),
  },
  {
    // El link del correo apunta a {FRONTEND_URL}/reset-password?token=…
    path: 'reset-password',
    loadComponent: () =>
      import('./iam/pages/reset-password/reset-password.page').then((m) => m.ResetPasswordPage),
  },
  {
    path: 'activate',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./iam/pages/redeem-access-code/redeem-access-code.page').then(
        (m) => m.RedeemAccessCodePage,
      ),
  },
  {
    path: 'change-password',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./iam/pages/change-password/change-password.page').then((m) => m.ChangePasswordPage),
  },
  {
    // Sin guard: la necesita sobre todo quien no puede iniciar sesión.
    path: 'help',
    loadComponent: () => import('./support/pages/help/help.page').then((m) => m.HelpPage),
  },

  // ---------- Bodega (STORE_ADMIN) ----------
  {
    path: 'store',
    canActivate: [authGuard, roleGuard('STORE_ADMIN')],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./reporting/pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./stores/pages/store-profile/store-profile.page').then((m) => m.StoreProfilePage),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./customers/pages/customer-list/customer-list.page').then((m) => m.CustomerListPage),
      },
      {
        path: 'customers/new',
        loadComponent: () =>
          import('./customers/pages/customer-new/customer-new.page').then((m) => m.CustomerNewPage),
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./customers/pages/customer-detail/customer-detail.page').then(
            (m) => m.CustomerDetailPage,
          ),
      },
      {
        path: 'customers/:id/cycles/:year/:month',
        loadComponent: () =>
          import('./billing/pages/statement/statement.page').then((m) => m.StatementPage),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./catalog/pages/product-list/product-list.page').then((m) => m.ProductListPage),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./catalog/pages/product-form/product-form.page').then((m) => m.ProductFormPage),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./catalog/pages/product-form/product-form.page').then((m) => m.ProductFormPage),
      },
      {
        path: 'purchases',
        loadComponent: () =>
          import('./credit/pages/purchase-list/purchase-list.page').then((m) => m.PurchaseListPage),
      },
      {
        path: 'purchases/new',
        loadComponent: () =>
          import('./credit/pages/purchase-new/purchase-new.page').then((m) => m.PurchaseNewPage),
      },
      {
        path: 'purchases/:id',
        loadComponent: () =>
          import('./credit/pages/purchase-detail/purchase-detail.page').then(
            (m) => m.PurchaseDetailPage,
          ),
      },
      {
        path: 'installments',
        loadComponent: () =>
          import('./credit/pages/installment-list/installment-list.page').then(
            (m) => m.InstallmentListPage,
          ),
      },
      {
        path: 'cycles',
        loadComponent: () =>
          import('./billing/pages/cycle-list/cycle-list.page').then((m) => m.CycleListPage),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./billing/pages/payments-hub/payments-hub.page').then((m) => m.PaymentsHubPage),
      },
      {
        path: 'payments/history',
        loadComponent: () =>
          import('./billing/pages/payment-list/payment-list.page').then((m) => m.PaymentListPage),
      },
      {
        path: 'payments/new',
        loadComponent: () =>
          import('./billing/pages/payment-new/payment-new.page').then((m) => m.PaymentNewPage),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./reporting/pages/report-summary/report-summary.page').then(
            (m) => m.ReportSummaryPage,
          ),
      },
    ],
  },

  // ---------- Portal del cliente (CUSTOMER) ----------
  {
    path: 'portal',
    canActivate: [authGuard, roleGuard('CUSTOMER')],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./reporting/pages/portal-home/portal-home.page').then((m) => m.PortalHomePage),
      },
      {
        path: 'stores/:storeId',
        loadComponent: () =>
          import('./reporting/pages/portal-store/portal-store.page').then((m) => m.PortalStorePage),
      },
    ],
  },

  // ---------- Administración del sistema (SYSTEM_ADMIN) ----------
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('SYSTEM_ADMIN')],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'stores' },
      {
        path: 'stores',
        loadComponent: () =>
          import('./stores/pages/admin-stores/admin-stores.page').then((m) => m.AdminStoresPage),
      },
      {
        path: 'bcrp-caps',
        loadComponent: () =>
          import('./regulation/pages/bcrp-caps/bcrp-caps.page').then((m) => m.BcrpCapsPage),
      },
      {
        path: 'trusted-store',
        loadComponent: () =>
          import('./customers/pages/trusted-store/trusted-store.page').then(
            (m) => m.TrustedStorePage,
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
