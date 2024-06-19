const { Builder, By, Key, until } = require('selenium-webdriver');

async function testOrderAddition() {
    let driver;

    try {
        driver = await new Builder().forBrowser('chrome').build();

        await driver.get('http://localhost:3000/orders');

        await driver.sleep(1000);
        await driver.wait(until.elementLocated(By.css('.grid-header-add-button')), 5000).click();
        await driver.sleep(1000);

        await driver.findElement(By.css('.order-num')).sendKeys('10100');
        await driver.sleep(500);

        await driver.findElement(By.css('.orderedfrom')).click();
        await driver.sleep(500);
        await driver.findElement(By.css('option[value="In-person"]')).click();
        await driver.sleep(500);

        await driver.findElement(By.css('.order-date')).sendKeys('18062024');
        await driver.sleep(500);

        await driver.findElement(By.css('.fulfillmentstatus')).click();
        await driver.sleep(500);
        await driver.findElement(By.css('option[value="Unfulfilled"]')).click();
        await driver.sleep(500);

        await driver.findElement(By.css('.paymentmethod')).click();
        await driver.sleep(500);
        await driver.findElement(By.css('option[value="Offline"]')).click();
        await driver.sleep(500);

        await driver.findElement(By.css('.paymentstatus')).click();
        await driver.sleep(500);
        await driver.findElement(By.css('option[value="Unpaid"]')).click();
        await driver.sleep(500);

        await driver.findElement(By.css('.shipping-fee')).sendKeys('150');
        await driver.sleep(500);

        await driver.findElement(By.id('plus-sign')).click();
        await driver.sleep(500);

        const productContainers = await driver.wait(until.elementsLocated(By.css('.container')), 10000);

        if (productContainers.length >= 2) {
            const firstProductContainer = productContainers[0];
            const firstProductImage = await firstProductContainer.findElement(By.css('.product-pic'));
            await firstProductImage.click();
            await driver.sleep(2000);

            await driver.findElement(By.css('.variations')).click();
            await driver.sleep(1000);

            await driver.findElement(By.css('option[value="L"]')).click();
            await driver.sleep(1000);

            for (let i = 0; i < 4; i++) {
                await driver.findElement(By.css('.plus')).click();
                await driver.sleep(500);
            }

            await driver.findElement(By.css('.add-to-cart')).click();
            await driver.sleep(500);

            await driver.findElement(By.css('.exit-product-details')).click();
            await driver.sleep(1000);

            const secondProductContainer = productContainers[3];
            const secondProductImage = await secondProductContainer.findElement(By.css('.product-pic'));
            await secondProductImage.click();
            await driver.sleep(2000);

            await driver.findElement(By.css('.variations')).click();
            await driver.sleep(1000);

            await driver.findElement(By.css('option[value="C"]')).click();
            await driver.sleep(1000);

            for (let i = 0; i < 10; i++) {
                await driver.findElement(By.css('.plus')).click();
                await driver.sleep(500);
            }

            await driver.findElement(By.css('.add-to-cart')).click();
            await driver.sleep(500);

            await driver.findElement(By.css('.exit-product-details')).click();
            await driver.sleep(1000);

        } else {
            console.error('There are not enough product containers to click the second image.');
        }

        await driver.findElement(By.css('.exit-product-list')).click();
        await driver.sleep(1000);

        await driver.findElement(By.css('.submitbtn')).click();
        await driver.sleep(3000);

        for (let i = 0; i < 4; i++) {
            await driver.findElement(By.id('next-button')).click();
            await driver.sleep(1000);
        }

        await driver.sleep(5000);

    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

testOrderAddition();
