const { test, expect } = require('@playwright/test');

test.describe('Suppliers Tests', () => {
    let page;

    test.beforeEach(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
    });
  
    test.afterEach(async () => {
      await page.close();
    });

  test('add supplier', async () => {
    await page.goto('./login');
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', 'Abstrak_Admin');
    await page.fill('input[name="password"]', 'TOUCH.DOWN!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    await page.goto('./collections');
    await page.click('.grid-header-add-button');
    await page.fill('#collection-name-input', 'TESTCOLL');
    await page.fill('#collection-description-input', 'TESTDESC');
    await page.setInputFiles('#imageInput', 'test/testimages/test.png');
    await page.click('.submit-collection-button');
    await page.waitForTimeout(2000);

    await page.goto('./auditlog');
    await page.waitForTimeout(1000);
    await page.waitForSelector('#audits-list tr');
    const logEntry = await page.locator('#audits-list tr').first();
    const newData = await logEntry.locator('td:nth-child(6)').textContent();
    const action = await logEntry.locator('td:nth-child(4)').textContent();
    const pageName = await logEntry.locator('td:nth-child(3)').textContent();

    expect(newData).toContain('New collection: TESTCOLL');
    expect(action).toContain('Add');
    expect(pageName).toContain('Collections');
  });

  test('edit supplier', async () => {
    await page.goto('./login');
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', 'Abstrak_Admin');
    await page.fill('input[name="password"]', 'TOUCH.DOWN!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    await page.goto('./collections');
    await page.waitForTimeout(1000);
    await page.click('.collection-item-container');
    await page.waitForTimeout(1000);

    await page.click('.grid-header-add-button');
    await page.fill('#product-name-input', 'TESTPRODUCT');
    await page.fill('#product-price-input', '123');
    await page.fill('#product-sku-input', '123');
    await page.fill('#material-input', 'TEST');
    await page.keyboard.press('Enter');
    await page.setInputFiles('#imageInput', 'test/testimages/test.png');
    await page.click('#next-form-button');
    await page.fill('input.product-form-variation.table-type', 'A');
    await page.fill('input.product-form-stock.table-type', '123');
    await page.fill('input.product-form-manucost.table-type', '123');
    await page.click('#next-form-button');
    await page.waitForTimeout(2000);

    await page.goto('./auditlog');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#audits-list tr');
    const logEntry = await page.locator('#audits-list tr').first();
    const newData = await logEntry.locator('td:nth-child(6)').textContent();
    const action = await logEntry.locator('td:nth-child(4)').textContent();
    const pageName = await logEntry.locator('td:nth-child(3)').textContent();

    expect(newData).toContain('New Product: TESTPRODUCT');
    expect(action).toContain('Add');
    expect(pageName).toContain('Collections');
  });
});
