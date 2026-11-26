import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../../iam/services/auth.service';
import { Role } from '../../iam/model/auth';
import { ReportingService } from '../../reporting/services/reporting.service';
import { Icon } from '../../shared/components/icon/icon';
import { LabelPipe } from '../../shared/pipes/label.pipe';
import { StoresService } from '../../stores/services/stores.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  /** Prefijos de URL que marcan el ítem como activo. */
  match: (url: string) => boolean;
}

const starts = (...prefixes: string[]) => (url: string) => prefixes.some((p) => url === p || url.startsWith(p + '/') || url.startsWith(p + '?'));

const NAV: Record<Role, NavItem[]> = {
  STORE_ADMIN: [
    { path: '/store/dashboard', label: 'Dashboard', icon: 'home', match: starts('/store/dashboard') },
    { path: '/store/customers', label: 'Clientes', icon: 'users', match: starts('/store/customers') },
    {
      path: '/store/purchases',
      label: 'Créditos',
      icon: 'bars',
      match: (u) => starts('/store/purchases')(u) && !u.startsWith('/store/purchases/new'),
    },
    { path: '/store/purchases/new', label: 'Compras', icon: 'cart', match: starts('/store/purchases/new') },
    { path: '/store/products', label: 'Productos', icon: 'box', match: starts('/store/products') },
    {
      path: '/store/payments',
      label: 'Pagos',
      icon: 'card',
      match: starts('/store/payments', '/store/installments', '/store/cycles'),
    },
    { path: '/store/reports', label: 'Reportes', icon: 'report', match: starts('/store/reports') },
    { path: '/store/profile', label: 'Configuración', icon: 'settings', match: starts('/store/profile') },
  ],
  CUSTOMER: [{ path: '/portal', label: 'Mis bodegas', icon: 'store', match: starts('/portal') }],
  SYSTEM_ADMIN: [
    { path: '/admin/stores', label: 'Bodegas', icon: 'store', match: starts('/admin/stores') },
    { path: '/admin/bcrp-caps', label: 'Topes BCRP', icon: 'percent', match: starts('/admin/bcrp-caps') },
    { path: '/admin/trusted-store', label: 'Bodega de confianza', icon: 'shield', match: starts('/admin/trusted-store') },
  ],
};

/** Marco de la app con sesión: barra lateral oscura con el logo y barra superior con la bodega y el usuario. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, Icon, LabelPipe],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly storesApi = inject(StoresService);
  private readonly reportingApi = inject(ReportingService);

  menuOpen = signal(false);
  userMenuOpen = signal(false);
  storeName = signal<string | null>(null);
  storeAddress = signal<string | null>(null);
  overdue = signal(0);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  nav = computed(() => {
    const role = this.auth.role();
    return role ? NAV[role] : [];
  });
  activePath = computed(() => this.nav().find((i) => i.match(this.url()))?.path ?? null);
  initials = computed(() => initialsOf(this.auth.user()?.full_name || this.auth.user()?.username || '?'));
  displayName = computed(() => this.auth.user()?.full_name || this.auth.user()?.username || '');

  title = computed(() => {
    switch (this.auth.role()) {
      case 'STORE_ADMIN':
        return this.storeName() ?? 'Mi bodega';
      case 'CUSTOMER':
        return 'Mi portal';
      default:
        return 'Soporte AlToque Pay';
    }
  });
  subtitle = computed(() => {
    switch (this.auth.role()) {
      case 'STORE_ADMIN':
        return this.storeAddress() || 'Agrega la dirección en Configuración';
      case 'CUSTOMER':
        return 'Tu crédito en cada bodega';
      default:
        return 'Administración del sistema';
    }
  });

  ngOnInit(): void {
    if (this.auth.role() === 'STORE_ADMIN') {
      this.storesApi.getProfile().subscribe({
        next: (s) => {
          this.storeName.set(s.business_name);
          this.storeAddress.set(s.address);
        },
        error: () => {},
      });
      this.reportingApi.dashboard().subscribe({
        next: (d) => this.overdue.set(d.overdue_installments + d.overdue_statements),
        error: () => {},
      });
    }
  }

  closeMenus(): void {
    this.menuOpen.set(false);
    this.userMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenus();
  }
}

function initialsOf(name: string): string {
  const parts = name.replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}
