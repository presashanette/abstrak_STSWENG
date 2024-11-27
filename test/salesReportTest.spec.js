const { test, expect } = require('@playwright/test');

test.describe('Sales Report Test', () => {
    let browser;
    let page; 
    let context; 

    test.beforeAll(async ({ browser }) => {
        context = await browser.newContext(); 
        page = await context.newPage(); 
    });

    test.afterAll(async () => {
        await context.close(); 
    });
    
    test('should add two orders and the sales graph should update', async () => {
        // LOGIN
        await page.goto('./login');
        await page.waitForTimeout(1000);
        await page.fill('input[name="username"]', 'Abstrak_Admin');
        await page.fill('input[name="password"]', 'TOUCH.DOWN!');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);

        // ADD ORDER 1
        await page.goto('./orders');
        await page.waitForTimeout(1000);
        await page.click('.grid-header-add-button'); 
        await page.fill('.order-num', '12345');
        await page.selectOption('.orderedfrom', 'In-person');
        await page.fill('#order-date', '2024-11-02');
        await page.selectOption('.fulfillmentstatus', 'Fulfilled');
        await page.selectOption('.paymentmethod', 'Offline');
        await page.selectOption('.paymentstatus', 'Paid');
        await page.fill('.shipping-fee', '12345');
        await page.click('#plus-sign'); 
        await page.click('.container'); 
        await page.click('.add-to-cart');
        await page.click('.exit-product-list'); 
        await page.click('.submitbtn'); 
        await page.waitForTimeout(5000);

        // ADD ORDER 2
  
        await page.waitForTimeout(1000);
        await page.click('.grid-header-add-button'); 
        await page.fill('.order-num', '12346');
        await page.selectOption('.orderedfrom', 'In-person');
        await page.fill('#order-date', '2024-11-03');
        await page.selectOption('.fulfillmentstatus', 'Fulfilled');
        await page.selectOption('.paymentmethod', 'Offline');
        await page.selectOption('.paymentstatus', 'Paid');
        await page.fill('.shipping-fee', '12345');
        await page.click('#plus-sign'); 
        await page.click('.container'); 
        await page.click('.add-to-cart');
        await page.click('.exit-product-list'); 
        await page.click('.submitbtn'); 
        await page.waitForTimeout(5000);

        // VERIFY SALES GRAPH
        await page.goto('./');
        await page.waitForTimeout(5000);

        const salesData = await page.evaluate(() => {
            const chart = Chart.getChart('salesChart');
            const data = chart.data.datasets[0].data;
            const labels = chart.data.labels;
            return { labels, data };
        });

        const novemberIndex = salesData.labels.indexOf('11/1/2024');
        const novemberSales = salesData.data[novemberIndex];
        console.log('November Sales Data:', novemberSales);
        expect(novemberSales).toBe(2);
    });

    test('the revenue graph should update', async () => {
        // SCROLL TO REVENUE CHART
        
        const revenueChart = await page.locator('#revenueChart');
        await revenueChart.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);

        const revData = await page.evaluate(() => {
            const chart = Chart.getChart('revenueChart');
            const data = chart.data.datasets[0].data;
            const labels = chart.data.labels;
            return { labels, data };
        });

        const novemberIndex = revData.labels.indexOf('11/1/2024');
        const novemberRev = revData.data[novemberIndex];
        console.log('November Revenue Data:', novemberRev);
        expect(novemberRev).toBe(1490);
    });

    test('the profit graph should update', async () => {
        // SCROLL TO PROFIT CHART
        const profitChart = await page.locator('#profitChart');
        await profitChart.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);

        const profitData = await page.evaluate(() => {
            const chart = Chart.getChart('profitChart');
            const data = chart.data.datasets[0].data;
            const labels = chart.data.labels;
            return { labels, data };
        });

        const novemberIndex = profitData.labels.indexOf('11/1/2024');
        const novemberProfit = profitData.data[novemberIndex];
        console.log('November Profit Data:', novemberProfit);
        expect(novemberProfit).toBe(1472);
    });
});
