const { Builder, By, until, Key } = require("selenium-webdriver");
const assert = require("assert");

describe("Sales Report Test", function () {
    let driver;

    // Increase timeout for tests
    this.timeout(50000);

    before(async function () {
        driver = await new Builder().forBrowser("chrome").build();
    });

    after(async function () {
        await driver.quit();
    });

    it("should add an order and the sales graph should update", async function () {
        //LOGIN
        await driver.get("http://localhost:3000/login");

        let usernameInput = await driver.findElement(By.name("username"));
        await usernameInput.sendKeys("Abstrak_Admin");

        let passwordInput = await driver.findElement(By.name("password"));
        await passwordInput.sendKeys("TOUCH.DOWN!");

        let loginButton = await driver.findElement(By.xpath("//button[@type='submit']"));
        await loginButton.click();
        await driver.sleep(2000);
        

        //ADD ORDER 1
        await driver.get("http://localhost:3000/orders");

        await driver.sleep(1000);
        let addOrderButton = await driver.findElement(By.xpath("//button[text()='Add Order']"));
        await addOrderButton.click();
        await driver.sleep(2000);

        let ordernum = await driver.findElement(By.className("order-num"));
        await ordernum.sendKeys("12345");

        let orderedfrom = await driver.findElement(By.className("orderedfrom"));
        await orderedfrom.sendKeys("In-person");

        let dateInput = await driver.findElement(By.id("order-date"));
        await dateInput.sendKeys("02-11-2024");

        let fulfillstatus = await driver.findElement(By.className("fulfillmentstatus"));
        await fulfillstatus.sendKeys("Fulfilled");

        let paymethod = await driver.findElement(By.className("paymentmethod"));
        await paymethod.sendKeys("Offline");

        let paymentstatus = await driver.findElement(By.className("paymentstatus"));
        await paymentstatus.sendKeys("Paid");

        let shippingrate = await driver.findElement(By.className("shipping-fee"));
        await shippingrate.sendKeys("12345");

        let additems = await driver.findElement(By.id("plus-sign"));
        await additems.click();
        await driver.sleep(2000);

        let item = await driver.findElement(By.className("container"));
        await item.click();
        await driver.sleep(1000);

        let addToCartButton = await driver.findElement(By.className("add-to-cart"));
        await addToCartButton.click();
        await driver.sleep(1000);

        let backbtn = await driver.findElement(By.className("exit-product-list"));
        await backbtn.click();
        await driver.sleep(1000);

        let submitButton = await driver.findElement(By.className("submitbtn"));
        await submitButton.click();
        await driver.sleep(2000);


        //ADD ORDER 2

        await driver.sleep(1000);
        addOrderButton = await driver.findElement(By.xpath("//button[text()='Add Order']"));
        await addOrderButton.click();
        await driver.sleep(2000);

        ordernum = await driver.findElement(By.className("order-num"));
        await ordernum.sendKeys("12346");

        orderedfrom = await driver.findElement(By.className("orderedfrom"));
        await orderedfrom.sendKeys("In-person");

        dateInput = await driver.findElement(By.id("order-date"));
        await dateInput.sendKeys("02-11-2024");

        fulfillstatus = await driver.findElement(By.className("fulfillmentstatus"));
        await fulfillstatus.sendKeys("Fulfilled");

        paymethod = await driver.findElement(By.className("paymentmethod"));
        await paymethod.sendKeys("Offline");

        paymentstatus = await driver.findElement(By.className("paymentstatus"));
        await paymentstatus.sendKeys("Paid");

        shippingrate = await driver.findElement(By.className("shipping-fee"));
        await shippingrate.sendKeys("12345");

        additems = await driver.findElement(By.id("plus-sign"));
        await additems.click();
        await driver.sleep(2000);

        item = await driver.findElement(By.className("container"));
        await item.click();
        await driver.sleep(1000);

        addToCartButton = await driver.findElement(By.className("add-to-cart"));
        await addToCartButton.click();
        await driver.sleep(1000);

        backbtn = await driver.findElement(By.className("exit-product-list"));
        await backbtn.click();
        await driver.sleep(1000);

        submitButton = await driver.findElement(By.className("submitbtn"));
        await submitButton.click();
        await driver.sleep(2000);


        
        await driver.get("http://localhost:3000");
        await driver.sleep(5000);

        const salesData = await driver.executeScript(() => {
            const chart = Chart.getChart("salesChart"); // Get the chart instance by canvas ID
            const data = chart.data.datasets[0].data;   // Access the sales data
            const labels = chart.data.labels;           // Access the labels (dates)
            return { labels, data };
        });

        // console.log("Sales Data:", salesData);
    
        // Verify if November sales data shows 2 orders (assuming November is at index 6)
        const novemberIndex = salesData.labels.indexOf("11/1/2024");
        const novemberSales = salesData.data[novemberIndex];
        console.log("November Sales Data:", novemberSales);
        assert.strictEqual(novemberSales, 2, "Sales for November is incorrect");
    });

    it("the revenue graph should update", async function () {
        
        // Scroll the revenue chart into view
        const revenueChart = await driver.findElement(By.id("revenueChart"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", revenueChart);
        await driver.sleep(1000); // Allow time for any dynamic loading

        // Now retrieve and check the chart data
        const revData = await driver.executeScript(() => {
            const chart = Chart.getChart("revenueChart");
            if (!chart) {
                throw new Error("Revenue chart instance not found.");
            }
            const data = chart.data.datasets[0].data;
            const labels = chart.data.labels;
            return { labels, data };
        });

        console.log("Revenue Data:", revData);

        const novemberIndex = revData.labels.indexOf("11/1/2024");
        const novemberRev = revData.data[novemberIndex];
        console.log("November Revenue Data:", novemberRev);
        assert.strictEqual(novemberRev, 1490, "Revenue for November is incorrect");
    });

    it("the profit graph should update", async function () {
        
        // Scroll the revenue chart into view
        const profitChart = await driver.findElement(By.id("profitChart"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", profitChart);
        await driver.sleep(1000); // Allow time for any dynamic loading

        // Now retrieve and check the chart data
        const profitData = await driver.executeScript(() => {
            const chart = Chart.getChart("profitChart");
            if (!chart) {
                throw new Error("Profit chart instance not found.");
            }
            const data = chart.data.datasets[0].data;
            const labels = chart.data.labels;
            return { labels, data };
        });

        console.log("Profit Data:", profitData);

        const novemberIndex = profitData.labels.indexOf("11/1/2024");
        const novemberProfit = profitData.data[novemberIndex];
        console.log("November Profit Data:", novemberProfit);
        assert.strictEqual(novemberProfit, 1474, "Profit for November is incorrect");
    });
});
