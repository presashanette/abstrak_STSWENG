const { Builder, By, until, Key } = require("selenium-webdriver");
const assert = require("assert");

describe("Audit Log Test", function () {
    let driver;

    // Increase timeout for tests
    this.timeout(50000);

    before(async function () {
        driver = await new Builder().forBrowser("chrome").build();
    });

    after(async function () {
        await driver.quit();
    });

    it("should add a collection and log it in the audit log", async function () {
        await driver.get("http://localhost:3000/login");

        let usernameInput = await driver.findElement(By.name("username"));
        await usernameInput.sendKeys("Abstrak_Admin");

        let passwordInput = await driver.findElement(By.name("password"));
        await passwordInput.sendKeys("TOUCH.DOWN!");

        let loginButton = await driver.findElement(By.xpath("//button[@type='submit']"));
        await loginButton.click();
        await driver.sleep(2000);

        // ADD COLLECTION
        let addColl = await driver.findElement(By.className("grid-header-add-button"));
        await addColl.click();
        await driver.sleep(2000);

        let collname = await driver.findElement(By.id("collection-name-input"));
        await collname.sendKeys("TESTCOLL");

        let colldesc = await driver.findElement(By.id("collection-description-input"));
        await colldesc.sendKeys("TESTDESC");

        let fileInput = await driver.findElement(By.id("imageInput"));
        fileInput.sendKeys("C:/Users/Jersey/Downloads/Y3/T1/STSWENG/abstrak_STSWENG/test/testimages/test.png");

        await driver.sleep(1000);

        let submitButton = await driver.findElement(By.className("submit-collection-button"));
        await submitButton.click();
        await driver.sleep(1000);

        // Navigate to audit log and verify
        await driver.get("http://localhost:3000/auditlog");
        await driver.sleep(2000);

        let logEntries = await driver.findElements(By.css("#audits-list tr"));

        let found = false;

        if (logEntries.length > 0) {
            let latestEntry = logEntries[0]; // Select the first (top) row
        
            let columns = await latestEntry.findElements(By.tagName("td"));
            let page = await columns[2].getText();
            let action = await columns[3].getText();
            let newData = await columns[5].getText();
        
            if (newData.includes("New collection: TESTCOLL") && action.includes("Add") && page.includes("Collections")) {
                found = true;
            }
        }

        assert.strictEqual(found, true, "Audit log did not contain the expected entry for the added collection.");
        
    });

    it("should add a product and log it in the audit log", async function () {
        await driver.get("http://localhost:3000/collections");
        await driver.sleep(2000);

        let item = await driver.findElement(By.className("collection-item-container"));
        await item.click();
        await driver.sleep(1000);

        let addProduct = await driver.findElement(By.className("grid-header-add-button"));
        await addProduct.click();
        await driver.sleep(1000);

        let prodname = await driver.findElement(By.id("product-name-input"));
        await prodname.sendKeys("TESTPRODUCT");

        let price = await driver.findElement(By.id("product-price-input"));
        await price.sendKeys("123");

        let sku = await driver.findElement(By.id("product-sku-input"));
        await sku.sendKeys("123");

        let material = await driver.findElement(By.id("material-input"));
        await material.sendKeys("TEST" + Key.ENTER);

        let fileInput = await driver.findElement(By.id("imageInput"));
        fileInput.sendKeys("C:/Users/Jersey/Downloads/Y3/T1/STSWENG/abstrak_STSWENG/test/testimages/test.png");

        await driver.sleep(1000);

        let nextButton = await driver.findElement(By.id("next-form-button"));
        await nextButton.click();
        await driver.sleep(2000);

        let variationInput = await driver.findElement(By.css('input.product-form-variation.table-type'));
        await variationInput.sendKeys("A");

        let stock = await driver.findElement(By.css('input.product-form-stock.table-type'));
        await stock.sendKeys("123");

        let manucost = await driver.findElement(By.css('input.product-form-manucost.table-type'));
        await manucost.sendKeys("123");

        await driver.sleep(2000);
        let doneButton = await driver.findElement(By.id("next-form-button"));
        await doneButton.click();
        await driver.sleep(1000);

        // Navigate to audit log and verify
        await driver.get("http://localhost:3000/auditlog");
        await driver.sleep(4000);

        let logEntries = await driver.findElements(By.css("#audits-list tr"));

        let found = false;
        for (let entry of logEntries) {
            let columns = await entry.findElements(By.tagName("td"));
            let page = await columns[2].getText();
            let action = await columns[3].getText();
            let newData = await columns[5].getText();

            if (newData.includes("New Product: TESTPRODUCT") && action.includes("Add") && page.includes("Collections")) {
                found = true;
                break;
            }
        }

        assert.strictEqual(found, true, "Audit log did not contain the expected entry for the added product.");
        
    });

    it("should edit a product and log it in the audit log", async function () {
        await driver.get("http://localhost:3000/collections");
        await driver.sleep(2000);

        let item = await driver.findElement(By.className("collection-item-container"));
        await item.click();
        await driver.sleep(1000);

        let threeDots = await driver.findElement(By.css("span.three-dots-product-option"));
        await threeDots.click();

        let deleteProduct = await driver.findElement(By.css("a.product-option-popup.edit-product"));
        await deleteProduct.click();

        let prodname = await driver.findElement(By.id("product-name-input"));
        await prodname.sendKeys("EDITED");

        await driver.sleep(1000);

        let nextButton = await driver.findElement(By.id("next-form-button"));
        await nextButton.click();
        await driver.sleep(2000);

        let doneButton = await driver.findElement(By.id("next-form-button"));
        await doneButton.click();
        await driver.sleep(1000);

        // Navigate to audit log and verify
        await driver.get("http://localhost:3000/auditlog");
        await driver.sleep(2000);

        let logEntries = await driver.findElements(By.css("#audits-list tr"));

        let found = false;
        for (let entry of logEntries) {
            let columns = await entry.findElements(By.tagName("td"));
            let page = await columns[2].getText();
            let action = await columns[3].getText();
            let newData = await columns[5].getText();

            if (newData.includes("EDITED") && action.includes("Edit") && page.includes("Product")) {
                found = true;
                break;
            }
        }

        assert.strictEqual(found, true, "Audit log did not contain the expected entry for the edited product.");
        
    });

    it("should delete a product and log it in the audit log", async function () {
        await driver.get("http://localhost:3000/collections");
        await driver.sleep(2000);

        let item = await driver.findElement(By.className("collection-item-container"));
        await item.click();
        await driver.sleep(1000);

        let threeDots = await driver.findElement(By.css("span.three-dots-product-option"));
        await threeDots.click();

        let deleteProduct = await driver.findElement(By.css("a.product-option-popup.delete-product"));
        await deleteProduct.click();

        let deleteButton = await driver.findElement(By.xpath("//button[text()='Yes, delete it!']"));
        await deleteButton.click();
        await driver.sleep(2000);

        let deleteAssociationsButton = await driver.findElement(By.xpath("//button[text()='Yes, delete associations']"));
        await deleteAssociationsButton.click();
        await driver.sleep(1000);

        await driver.get("http://localhost:3000/auditlog");
        await driver.sleep(1000);

        let logEntries = await driver.findElements(By.css("#audits-list tr"));

        let found = false;
        for (let entry of logEntries) {
            let columns = await entry.findElements(By.tagName("td"));
            let page = await columns[2].getText();
            let action = await columns[3].getText();
            let oldData = await columns[4].getText();

            if (oldData.includes("Hand-Drawn TeeEDITED") && action.includes("Delete") && page.includes("Products")) {
                found = true;
                break;
            }
        }

        assert.strictEqual(found, true, "Audit log did not contain the expected entry for the deleted product.");
        
    });

    it("should add an order and log it in the audit log", async function () {
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
        await dateInput.sendKeys("23-10-2024");

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
        await driver.get("http://localhost:3000/auditlog");
        

        let logEntries = await driver.findElements(By.css("#audits-list tr"));

        await driver.sleep(1000);
        let found = false;
        for (let entry of logEntries) {
            let columns = await entry.findElements(By.tagName("td"));
            let page = await columns[2].getText();
            let action = await columns[3].getText();
            let newData = await columns[5].getText();

            if (newData.includes("New order: 12345") && action.includes("Add") && page.includes("Orders")) {
                found = true;
                break;
            }
        }

        assert.strictEqual(found, true, "Audit log did not contain the expected entry for the added order.");
        
    });

    it("should add an expense and log it in the audit log", async function () {
        await driver.get("http://localhost:3000/expenses");

        let addExpButton = await driver.findElement(By.id("add-expense-btn"));
        await addExpButton.click();
        await driver.sleep(2000);

        let expname = await driver.findElement(By.id("name"));
        await expname.sendKeys("TESTEXPENSE");

        let collection = await driver.findElement(By.id("collection"));
        await collection.sendKeys("Made Human");

        let dateInput = await driver.findElement(By.id("date"));
        await dateInput.sendKeys("23-10-2024");

        let paymethod = await driver.findElement(By.id("payment-method"));
        await paymethod.sendKeys("Cash");

        let amount = await driver.findElement(By.id("amount"));
        await amount.sendKeys("12345");

        let qty = await driver.findElement(By.id("quantity"));
        await qty.sendKeys("12");

        let categ = await driver.findElement(By.id("category"));
        await categ.sendKeys("Fabric");

        let receipturl = await driver.findElement(By.id("receipt-url"));
        await receipturl.sendKeys("https://dlsu.instructure.com/");

        let desc = await driver.findElement(By.id("description"));
        await desc.sendKeys("testing edit expense for audit log");

        let submitButton = await driver.findElement(By.xpath("//button[@type='submit' and text()='Submit']"));
        await submitButton.click();

        await driver.get("http://localhost:3000/auditlog");
        await driver.sleep(2000);

        let logEntries = await driver.findElements(By.css("#audits-list tr"));

        let found = false;
        for (let entry of logEntries) {
            let columns = await entry.findElements(By.tagName("td"));
            let page = await columns[2].getText();
            let action = await columns[3].getText();
            let newData = await columns[5].getText();
            let user = await columns[1].getText();

            if (newData.includes("New expense under: TESTEXPENSE") && action.includes("Add") && page.includes("Expense")) {
                found = true;
                break;
            }
        }

        assert.strictEqual(found, true, "Audit log did not contain the expected entry for the added expense.");
        
    });

    it("should edit an expense and log it in the audit log", async function () {
        await driver.get("http://localhost:3000/expenses");
        await driver.sleep(1000);
        let deleteButton = await driver.findElement(By.css("button.edit-btn.btn"));
        await deleteButton.click();  

        await driver.sleep(1000);
        let expname = await driver.findElement(By.id("name"));
        await expname.sendKeys("EDITED");

        let submitButton = await driver.findElement(By.xpath("//button[@type='submit' and text()='Submit']"));
        await submitButton.click();

        await driver.get("http://localhost:3000/auditlog");
        await driver.sleep(2000);

        let logEntries = await driver.findElements(By.css("#audits-list tr"));

        let found = false;
        for (let entry of logEntries) {
            let columns = await entry.findElements(By.tagName("td"));
            let page = await columns[2].getText();
            let action = await columns[3].getText();
            let newData = await columns[5].getText();

            if (newData.includes("TESTEXPENSEEDITED") && action.includes("Edit") && page.includes("Expenses")) {
                found = true;
                break;
            }
        }

        assert.strictEqual(found, true, "Audit log did not contain the expected entry for the edited expense.");
        
    });

    it("should delete an expense and log it in the audit log", async function () {
        await driver.get("http://localhost:3000/expenses");
        await driver.sleep(1000);
        let deleteButton = await driver.findElement(By.css("button.delete-btn.btn"));
        await deleteButton.click();
        
        await driver.sleep(1000);
        let confirmDeleteButton = await driver.findElement(By.xpath("//button[text()='Yes, delete it!']"));
        await confirmDeleteButton.click();

        await driver.get("http://localhost:3000/auditlog");
        await driver.sleep(2000);

        let logEntries = await driver.findElements(By.css("#audits-list tr"));

        let found = false;
        for (let entry of logEntries) {
            let columns = await entry.findElements(By.tagName("td"));
            let page = await columns[2].getText();
            let action = await columns[3].getText();
            let oldData = await columns[4].getText();

            if (oldData.includes("Deleted expense under: TESTEXPENSEEDITED") && action.includes("Delete") && page.includes("Expenses")) {
                found = true;
                break;
            }
        }

        assert.strictEqual(found, true, "Audit log did not contain the expected entry for the deleted expense.");
        
    });
});
