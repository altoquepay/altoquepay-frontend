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

    expect(page.termOptions()).toEqual([1, 2, 3, 4]);
    expect(page.weeks().map((w) => w.grace)).toEqual([false, false, false, false]);
    expect(sent()).toMatchObject({ mode: 'WEEKLY', installments_count: 4, grace_weeks: [] });
  });

  it('makes any week of the term of grace: at the start, between installments or both', () => {
    const { page, sent } = create();

    page.toggleGrace(3);
    page.toggleGrace(1);
    page.simulate();

    expect(page.installments()).toBe(2);
    expect(sent()).toMatchObject({ installments_count: 2, grace_weeks: [1, 3], items: [{ product_id: 3, quantity: 1 }] });
  });

  it('never makes the last week of grace, and a second touch turns a week back into an installment', () => {
    const { page } = create();

    page.toggleGrace(4);
    page.toggleGrace(2);
    page.toggleGrace(2);

    expect(page.graceWeeks()).toEqual([]);
    expect(page.weeks()[3]).toEqual({ week: 4, grace: false, last: true });
  });

  it('drops the grace weeks a shorter term leaves out', () => {
    const { page } = create();
    page.toggleGrace(1);
    page.toggleGrace(3);

    page.setTerm(3);

    expect(page.graceWeeks()).toEqual([1]);
    expect(page.installments()).toBe(2);
  });

  it('sends no installments nor grace for a single date purchase', () => {
    const { page, sent } = create();

    page.toggleGrace(1);
    page.setMode('SINGLE_DATE');
    page.simulate();

    expect(sent()).toMatchObject({ mode: 'SINGLE_DATE', installments_count: null, grace_weeks: [] });
  });

  it('fits the term and the grace to a customer with fewer weeks', () => {
    const { page } = create();
    page.toggleGrace(3);

    page.pickCustomer({ ...account, max_weeks: 2 });

    expect(page.term()).toBe(2);
    expect(page.graceWeeks()).toEqual([]);
    expect(page.installments()).toBe(2);
  });
});
