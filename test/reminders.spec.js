const { test, expect } = require('@playwright/test');

test.describe('Alerts/Reminders Test', () => {
    let context;
    let page;

    test.beforeAll(async ({ browser }) => {
        context = await browser.newContext(); 
        page = await context.newPage(); 

        await page.goto('./login');
        await page.fill('input[name="username"]', 'Abstrak_Admin');
        await page.fill('input[name="password"]', 'TOUCH.DOWN!');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000); 
    });

    test.afterAll(async () => {
        await context.close(); 
    });

    test('should add two reminders and the reminders column should update', async () => {
        // Add reminders
        await page.click('.add-alert');
        await page.fill('#descriptionInput', '1 TEST REMINDER');
        await page.click('#confirmButton');
        await page.waitForTimeout(1000);

        await page.click('.add-alert');
        await page.fill('#descriptionInput', '2 TEST REMINDER');
        await page.click('#confirmButton');
        await page.waitForTimeout(1000);

        await page.evaluate(() => {
            const container = document.querySelector('#alerts-container');
            container.scrollTop = container.scrollHeight;
        });

        // Validate reminders
        const alerts = page.locator('#alerts-container .alert-item');
        const alertCount = await alerts.count();

        const secondLastAlertText = await alerts.nth(alertCount - 2).locator('.alert-description').textContent();
        const lastAlertText = await alerts.nth(alertCount - 1).locator('.alert-description').textContent();

        expect(secondLastAlertText?.trim()).toBe("1 TEST REMINDER");
        expect(lastAlertText?.trim()).toBe("2 TEST REMINDER");
    });

    test('should not be able to add a reminder without a description', async () => {
        const alerts = page.locator('#alerts-container .alert-item');
        const initialCount = await alerts.count();

        await page.click('.add-alert');
        await page.click('#confirmButton');
        await page.waitForTimeout(3000);


        //VERIFY
        const finalCount = await alerts.count();
        expect(finalCount).toBe(initialCount);

        await page.click('#cancelButton');
    });

    test('should delete a reminder and the reminders column should update', async () => {

        await page.evaluate(() => {
            const container = document.querySelector('#alerts-container');
            container.scrollTop = container.scrollHeight;
        });

        const deleteButtons = page.locator('.delete-alert');
        await deleteButtons.last().click();
        await page.waitForTimeout(1000);

        // VRIFY
        const alerts = page.locator('#alerts-container .alert-item');
        const alertCount = await alerts.count();
        const lastAlertText = alertCount > 0 ? await alerts.nth(alertCount - 1).locator('.alert-description').textContent() : null;

        if (alertCount > 0) {
            expect(lastAlertText?.trim()).toBe("1 TEST REMINDER");
        } else {
            expect(alertCount).toBe(0);
        }
    });
});
