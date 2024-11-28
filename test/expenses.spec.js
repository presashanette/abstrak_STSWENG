const { test, expect } = require('@playwright/test');

test.describe('Expenses Tests', () => {
    let page;

    test.beforeEach(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
    });
  
    test.afterEach(async () => {
      await page.close();
    });
    
  test('should add an expense', async () => {
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
    await page.fill('#description', 'testing edit expense');
    await page.click('button[type="submit"]');
  });

  test('should edit an expense', async () => {
    await page.goto('./login');
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', 'Abstrak_Admin');
    await page.fill('input[name="password"]', 'TOUCH.DOWN!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    await page.goto('./expenses');
    await page.waitForTimeout(1000);
    await page.click('button.edit-btn.btn'); 
    await page.fill('#name', 'TESTEXPENSEEDITED'); 
    await page.click('button[type="submit"]');
  });

  test('should delete an expense', async () => {
    await page.goto('./login');
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', 'Abstrak_Admin');
    await page.fill('input[name="password"]', 'TOUCH.DOWN!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    await page.goto('./expenses');
    await page.waitForTimeout(2000);
    await page.click('button.delete-btn.btn'); 
    await page.click('text=Yes, delete it!');

  });
  
});
