// Responsive check: opens every page at several widths and reports what overflows the screen.
//
// It signs in against a running backend, so the pages show real data. Run it from the root of
// the repository with the app and the backend running:
//
//   STORE_EMAIL=admin@mi-bodega.pe STORE_PASSWORD=... node tests/responsive.mjs
//
// Optional: WEB_URL, API_URL, WIDTHS (comma-separated), BROWSER_CHANNEL (chrome or msedge; the
// installed browser is used, so Playwright needs no download) and SCREENSHOTS=1 to save a
// screenshot of each page in test-results/responsive.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const web = process.env.WEB_URL ?? 'http://localhost:4200';
const api = process.env.API_URL ?? 'http://localhost:8000/api/v1';
const widths = (process.env.WIDTHS ?? '320,375,414,768,1024,1280,1440').split(',').map(Number);
const screenshots = process.env.SCREENSHOTS === '1';
const directory = 'test-results/responsive';
const publicPaths = ['/login', '/register', '/forgot-password', '/activate', '/help'];

/** Sign in as the store administrator and find one customer, product, purchase and cycle to open. */
async function storeSession() {
  const { STORE_EMAIL: email, STORE_PASSWORD: password } = process.env;
  if (!email || !password) {
    console.warn('STORE_EMAIL and STORE_PASSWORD are not set: only the public pages are checked.');
    return null;
  }
  const signedIn = await fetch(`${api}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: email, password }),
  });
  if (!signedIn.ok) throw new Error(`Sign-in failed with ${signedIn.status}`);
  const { access_token: token } = await signedIn.json();
  const get = async (path) => (await fetch(`${api}${path}`, { headers: { Authorization: `Bearer ${token}` } })).json();
  const user = await get('/auth/me');
  const [customer] = (await get('/customers?size=1')).items ?? [];
  const [product] = (await get('/products?size=1')).items ?? [];
  const [purchase] = (await get('/purchases?size=1')).items ?? [];
  const [cycle] = (await get('/cycles?size=1')).items ?? [];
  const paths = ['/store/dashboard', '/store/profile', '/store/customers', '/store/customers/new',
    '/store/products', '/store/products/new', '/store/purchases', '/store/purchases/new',
    '/store/installments', '/store/cycles', '/store/payments', '/store/payments/history',
    '/store/payments/new', '/store/reports'];
  if (customer) paths.push(`/store/customers/${customer.id}`);
  if (product) paths.push(`/store/products/${product.id}`);
  if (purchase) paths.push(`/store/purchases/${purchase.id}`);
  if (cycle) paths.push(`/store/customers/${cycle.customer_id}/cycles/${cycle.year}/${cycle.month}`);
  return { token, user, paths };
}

/** What sticks out of the screen without being inside something that scrolls on its own. */
function measure() {
  const width = innerWidth;
  const offenders = new Set();
  for (const element of document.querySelectorAll('body *')) {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    if (rect.right <= width + 1 && rect.left >= -1) continue;
    if (element.closest('.sidebar, .toasts')) continue;
    let scrolls = false;
    for (let parent = element.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
      if (['auto', 'scroll'].includes(getComputedStyle(parent).overflowX)) {
        scrolls = true;
        break;
      }
    }
    if (!scrolls) {
      const classes = String(element.className || '').trim().split(/\s+/).filter((c) => c && !c.startsWith('ng-'));
      offenders.add([element.tagName.toLowerCase(), ...classes.slice(0, 2)].join('.'));
    }
  }
  return { pageScroll: document.documentElement.scrollWidth - width, offenders: [...offenders].slice(0, 8) };
}

const session = await storeSession();
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'chrome', headless: true });
if (screenshots) await mkdir(directory, { recursive: true });
const problems = [];
try {
  for (const width of widths) {
    for (const [signedIn, paths] of [[false, publicPaths], [true, session?.paths ?? []]]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      if (signedIn) {
        await context.addInitScript(({ token, user }) => {
          localStorage.setItem('altoquepay.token', token);
          localStorage.setItem('altoquepay.user', JSON.stringify(user));
          localStorage.setItem('altoquepay.mustChange', 'false');
        }, session);
      }
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      for (const path of paths) {
        errors.length = 0;
        await page.goto(web + path);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(400);
        const result = await page.evaluate(measure);
        if (screenshots) {
          await page.screenshot({ path: `${directory}/${width}${path.replaceAll('/', '_')}.png`, fullPage: true });
        }
        if (result.pageScroll > 0 || result.offenders.length || errors.length) {
          problems.push({ width, path, ...result, errors: [...errors] });
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}

if (problems.length) {
  console.error(JSON.stringify(problems, null, 2));
  console.error(`${problems.length} page(s) overflow or fail.`);
  process.exitCode = 1;
} else {
  const pages = publicPaths.length + (session?.paths.length ?? 0);
  console.log(`No page overflows: ${pages} pages at ${widths.join(', ')} px.`);
}
