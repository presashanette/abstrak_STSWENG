const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

(async function testProductList() {
    let driver = await new Builder().forBrowser('chrome').build();
    
    try {
        await driver.get('http://localhost:3000/collections');
        await delay(1000);

        await driver.wait(until.elementLocated(By.css('.collection-item-container')), 10000);
        await delay(1000);

        let collectionItem = await driver.findElement(By.css('.collection-item-container'));
        await collectionItem.click();

        //verifier if the collection is clicked
        console.log('collection is clicked');
        await delay(1000);
        
        await driver.wait(until.urlContains('/collections/'), 10000);
        await delay(1000);

        //verifier if the collection is opened once clicked
        let productList = await driver.findElements(By.css('.container'));
        if (productList.length > 0) {
            console.log('products inside the collection can now be viewed!');
        } else {
            console.log('the collection did not open, try again.');
        }

    } finally {
        await driver.quit();
    }
})();

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}