import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Product } from '../../../catalog/model/product';
import { ProductsService } from '../../../catalog/services/products.service';
import { CustomerAccount } from '../../../customers/model/customer';
import { CustomersService } from '../../../customers/services/customers.service';
import { RegisterPurchase } from '../../model/purchase';
import { PurchasesService } from '../../services/purchases.service';
import { PurchaseNewPage } from './purchase-new.page';

describe('PurchaseNewPage', () => {
  const account = { id: 7, status: 'ACTIVE', max_weeks: 4, first_names: 'Rosa', last_names: 'Quispe' } as CustomerAccount;
  const rice = { id: 3, list_price: '100.00', description: 'Arroz extra 5 kg', category: 'Abarrotes' } as Product;

  function create() {
    const simulatePurchase = vi.fn().mockReturnValue(of(null));
    TestBed.configureTestingModule({
      imports: [PurchaseNewPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: CustomersService, useValue: { listCustomers: () => of({ items: [] }), getCustomer: () => of(account) } },
        { provide: ProductsService, useValue: { listProducts: () => of({ items: [] }) } },
        { provide: PurchasesService, useValue: { simulatePurchase, registerPurchase: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(PurchaseNewPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.pickCustomer(account);
    page.addProduct(rice);
    return { page, sent: () => simulatePurchase.mock.lastCall?.[0] as RegisterPurchase, simulatePurchase };
  }

  it('starts without grace, with every week as an installment', () => {
    const { page, sent } = create();

    page.simulate();

    expect(page.graceOptions()).toEqual([0, 1, 2, 3]);
    expect(page.weekOptions()).toEqual([1, 2, 3, 4]);
    expect(sent()).toMatchObject({ mode: 'WEEKLY', installments_count: 4, grace_weeks: 0 });
  });

  it('keeps the term when grace is chosen, so the installments left go down', () => {
    const { page, sent } = create();

    page.setGraceWeeks(1);
    page.simulate();

    expect(page.installments()).toBe(3);
    expect(page.weekOptions()).toEqual([1, 2, 3]);
    expect(sent()).toMatchObject({ installments_count: 3, grace_weeks: 1, items: [{ product_id: 3, quantity: 1 }] });
  });

  it('keeps the installments chosen when they already fit with the grace', () => {
    const { page } = create();

    page.setInstallments(2);
    page.setGraceWeeks(2);

    expect(page.installments()).toBe(2);
  });

  it('sends no installments nor grace for a single date purchase', () => {
    const { page, sent } = create();

    page.setGraceWeeks(1);
    page.setMode('SINGLE_DATE');
    page.simulate();

    expect(sent()).toMatchObject({ mode: 'SINGLE_DATE', installments_count: null, grace_weeks: 0 });
  });

  it('fits the grace and installments to a customer with fewer weeks', () => {
    const { page } = create();
    page.setGraceWeeks(3);

    page.pickCustomer({ ...account, max_weeks: 2 });

    expect(page.graceWeeks()).toBe(1);
    expect(page.installments()).toBe(1);
  });
});
