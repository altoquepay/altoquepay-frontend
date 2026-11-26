import { routes } from './app.routes';

describe('routes', () => {
  it('lets anyone open the help page', () => {
    const help = routes.find((route) => route.path === 'help');
    expect(help?.loadComponent).toBeDefined();
    expect(help?.canActivate).toBeUndefined();
  });

  it('declares the help page before the catch-all redirect', () => {
    const helpIndex = routes.findIndex((route) => route.path === 'help');
    expect(helpIndex).toBeGreaterThan(-1);
    expect(helpIndex).toBeLessThan(routes.findIndex((route) => route.path === '**'));
  });
});
