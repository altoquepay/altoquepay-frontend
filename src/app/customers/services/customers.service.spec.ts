import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CustomerAccount } from '../model/customer';
import { CustomersService } from './customers.service';

describe('CustomersService', () => {
  it('reactivates an account with PATCH /customers/{id}/reactivate', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const customersApi = TestBed.inject(CustomersService);
    const httpTesting = TestBed.inject(HttpTestingController);
    let reactivated: CustomerAccount | undefined;

    customersApi.reactivateCustomer(7).subscribe((account) => (reactivated = account));

    const request = httpTesting.expectOne(`${environment.apiUrl}/customers/7/reactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});
    request.flush({ id: 7, status: 'ACTIVE' });
    expect(reactivated?.status).toBe('ACTIVE');
    httpTesting.verify();
  });
});
