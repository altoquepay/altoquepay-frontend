import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HelpPage } from './help.page';

describe('HelpPage', () => {
  async function renderSignedOut(): Promise<HTMLElement> {
    sessionStorage.clear();
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HelpPage],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
    const fixture = TestBed.createComponent(HelpPage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the support email as a mailto link', async () => {
    const page = await renderSignedOut();
    expect(page.querySelector('a[href^="mailto:"]')?.getAttribute('href')).toBe('mailto:soporte@altoquepay.pe');
  });

  it('sends a signed-out visitor back to the sign-in page', async () => {
    const page = await renderSignedOut();
    expect(page.querySelector('a.back-link')?.getAttribute('href')).toBe('/login');
  });
});
