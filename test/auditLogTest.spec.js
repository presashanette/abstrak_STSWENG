const { test, expect } = require('@playwright/test');

test.describe('Audit Log Tests', () => {
    let page;

    test.beforeEach(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
    });
  
    test.afterEach(async () => {
      await page.close();
    });

  test('should add a collection and log it in the audit log', async () => {
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

  test('should add a product and log it in the audit log', async () => {
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

  test('should edit a product and log it in the audit log', async () => {
    await page.goto('./login');
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', 'Abstrak_Admin');
    await page.fill('input[name="password"]', 'TOUCH.DOWN!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    await page.goto('./collections');
    await page.waitForTimeout(1000);
    await page.click('.collection-item-container');
    await page.click('span.three-dots-product-option');
    await page.click('a.product-option-popup.edit-product');

    await page.fill('#product-name-input', 'EDITED');
    await page.click('#next-form-button');
    await page.click('#next-form-button');
    await page.waitForTimeout(2000);

    await page.goto('./auditlog');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#audits-list tr', { timeout: 5000 });
    const logEntry = await page.locator('#audits-list tr').first();
    const newData = await logEntry.locator('td:nth-child(6)').textContent();
    const action = await logEntry.locator('td:nth-child(4)').textContent();
    const pageName = await logEntry.locator('td:nth-child(3)').textContent();

    expect(newData).toContain('EDITED');
    expect(action).toContain('Edit');
    expect(pageName).toContain('Product');
  });

  test('should delete a product and log it in the audit log', async () => {
    await page.goto('./login');
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', 'Abstrak_Admin');
    await page.fill('input[name="password"]', 'TOUCH.DOWN!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    await page.goto('./collections');
    await page.waitForTimeout(1000);
    await page.click('.collection-item-container');
    await page.click('span.three-dots-product-option');
    await page.click('a.product-option-popup.delete-product');
    await page.click('text=Yes, delete it!');
    await page.click('text=Yes, delete associations');
    await page.waitForTimeout(5000);

    await page.goto('./auditlog');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#audits-list tr', { timeout: 5000 });
    
    const logEntry = await page.locator('#audits-list tr').first();
    const oldData = await logEntry.locator('td:nth-child(5)').textContent();
    const action = await logEntry.locator('td:nth-child(4)').textContent();
    const pageName = await logEntry.locator('td:nth-child(3)').textContent();

    expect(oldData).toContain('EDITED');
    expect(action).toContain('Delete');
    expect(pageName).toContain('Products');
  });

  test('should add an expense and log it in the audit log', async () => {
    await page.goto('./login');
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', 'Abstrak_Admin');
    await page.fill('input[name="password"]', 'TOUCH.DOWN!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    await page.goto('./expenses');
    await page.waitForTimeout(1000);
    await page.click('#add-expense-btn');
    await page.fill('#name', 'TESTEXPENSE');
    await page.selectOption('#collection', 'Made Human');
    await page.fill('#date', '2024-10-23');
    await page.selectOption('#payment-method', 'Cash');
    await page.fill('#amount', '12345');
    await page.fill('#quantity', '12');
    await page.selectOption('#category', 'Fabric');
    await page.fill('#receipt-url', 'https://dlsu.instructure.com/');
    await page.fill('#description', 'testing edit expense for audit log');
    await page.click('button[type="submit"]');

    await page.goto('./auditlog');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#audits-list tr', { timeout: 5000 });
    const logEntry = await page.locator('#audits-list tr').first();
    const newData = await logEntry.locator('td:nth-child(6)').textContent();
    const action = await logEntry.locator('td:nth-child(4)').textContent();
    const pageName = await logEntry.locator('td:nth-child(3)').textContent();

    expect(newData).toContain('New expense under: TESTEXPENSE');
    expect(action).toContain('Add');
    expect(pageName).toContain('Expense');
  });

  test('should edit an expense and log it in the audit log', async () => {
    await page.goto('./login');
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', 'Abstrak_Admin');
    await page.fill('input[name="password"]', 'TOUCH.DOWN!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    await page.goto('./expenses');
    await page.waitForTimeout(1000);
    await page.click('button.edit-btn.btn'); // Selects the edit button for the expense
    await page.fill('#name', 'TESTEXPENSEEDITED'); // Append EDITED to the expense name
    await page.click('button[type="submit"]');
  
    await page.goto('./auditlog');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#audits-list tr', { timeout: 10000 });
    const logEntry = await page.locator('#audits-list tr').first();
    const newData = await logEntry.locator('td:nth-child(6)').textContent();
    const action = await logEntry.locator('td:nth-child(4)').textContent();
    const pageName = await logEntry.locator('td:nth-child(3)').textContent();
  
    expect(newData).toContain('TESTEXPENSEEDITED');
    expect(action).toContain('Edit');
    expect(pageName).toContain('Expenses');
  });

  test('should delete an expense and log it in the audit log', async () => {
    await page.goto('./login');
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', 'Abstrak_Admin');
    await page.fill('input[name="password"]', 'TOUCH.DOWN!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    await page.goto('./expenses');
    await page.waitForTimeout(2000);
    await page.click('button.delete-btn.btn'); // Clicks the delete button for the expense
    await page.click('text=Yes, delete it!'); // Confirms deletion
  
    await page.goto('./auditlog');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#audits-list tr', { timeout: 5000 });
    const logEntry = await page.locator('#audits-list tr').first();
    const oldData = await logEntry.locator('td:nth-child(5)').textContent();
    const action = await logEntry.locator('td:nth-child(4)').textContent();
    const pageName = await logEntry.locator('td:nth-child(3)').textContent();
  
    expect(oldData).toContain('Deleted expense under: TESTEXPENSEEDITED');
    expect(action).toContain('Delete');
    expect(pageName).toContain('Expenses');
  });

  test('should add an order and log it in the audit log', async () => {
    await page.goto('./login');
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', 'Abstrak_Admin');
    await page.fill('input[name="password"]', 'TOUCH.DOWN!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    await page.goto('./orders');
    await page.waitForTimeout(4000);
    await page.click('.grid-header-add-button'); // Clicks the "Add Order" button
    await page.fill('.order-num', '12345');
    await page.selectOption('.orderedfrom', 'In-person');
    await page.fill('#order-date', '2024-10-23');
    await page.selectOption('.fulfillmentstatus', 'Fulfilled');
    await page.selectOption('.paymentmethod', 'Offline');
    await page.selectOption('.paymentstatus', 'Paid');
    await page.fill('.shipping-fee', '12345');
    await page.click('#plus-sign'); // Adds items to the order
    await page.click('.container'); // Select the item container
    await page.click('.add-to-cart');
    await page.click('.exit-product-list'); // Exits product list
    await page.click('.submitbtn'); // Submits the order
    await page.waitForTimeout(5000);
  
    await page.goto('./auditlog');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#audits-list tr', { timeout: 5000 });
    const logEntry = await page.locator('#audits-list tr').first();
    const newData = await logEntry.locator('td:nth-child(6)').textContent();
    const action = await logEntry.locator('td:nth-child(4)').textContent();
    const pageName = await logEntry.locator('td:nth-child(3)').textContent();
  
    expect(newData).toContain('New order: 12345');
    expect(action).toContain('Add');
    expect(pageName).toContain('Orders');
  });
  
});
