const { Builder, By, Key, until } = require("selenium-webdriver");
const assert = require('assert'); // Import the assert module

async function testAddExpense() {
  let driver;
  try {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.get('http://localhost:3000/login');
    const usernameInput = await driver.findElement(By.id('username'));
    await usernameInput.sendKeys('Abstrak_Admin');
    await driver.sleep(500);

    const passwordInput = await driver.findElement(By.id('password'));
    await passwordInput.sendKeys('TOUCH.DOWN!');
    await driver.sleep(500);

    const loginButton = await driver.findElement(By.css('.action-button'));
    await loginButton.click();
    await driver.sleep(500);

    const sidebar = await driver.findElement(By.css('.header-menu'));
    await sidebar.click();
    await driver.sleep(500);
    
    const ordersOption = await driver.findElement(By.css('a[href="/expenses"]'));
    await ordersOption.click();
    await driver.sleep(500);
    
    const testCases = [
      // VALID EXPENSE
      {
        nameInput: "Cotton Shirt",
        collectionInput: "Love Letters",
        dateInput: "10-22-2024",
        amountInput: "100",
        quantityInput: "2",
        categoryInput: "Fabric",
        descriptionInput: "Cotton",
        receiptUrlInput: "http://localhost:3000/expenses"
      }
    ];
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        try {
            await runTestCase(driver, testCase, i + 1);
        } catch (err) {
            console.error(`Test case ${i + 1} failed: ${err.message}`);
        }
    }
} catch (error) {
    console.error("Error occurred:", error);
} finally {
    if (driver) {
        await driver.quit();
    }
}
}

async function runTestCase(driver, testCase, caseIndex) {
const TIMEOUT = 10000; // Set a 10-second timeout for each test case

// Custom function to add a timeout
const withTimeout = (promise, ms) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Test case took too long and was aborted")), ms))
    ]);
};

await driver.wait(until.elementLocated(By.id('add-expense-btn')), 5000).click();
await driver.sleep(500);

const nameInput = await driver.findElement(By.id("name"));
await nameInput.clear();
await nameInput.sendKeys(testCase.nameInput);
await driver.sleep(500);

const collectionInput = await driver.findElement(By.css(`#collection option[value='${testCase.collectionInput}']`));
await collectionInput.click();
await driver.sleep(500);

const dateInput = await driver.findElement(By.id("date"));
await dateInput.clear();
await dateInput.sendKeys(testCase.dateInput);
await driver.sleep(500);

const amountInput = await driver.findElement(By.id("amount"));
await amountInput.clear();
await amountInput.sendKeys(testCase.amountInput);
await driver.sleep(500);

const quantityInput = await driver.findElement(By.id("quantity"));
await quantityInput.clear();
await quantityInput.sendKeys(testCase.quantityInput);
await driver.sleep(500);

const categoryInput = await driver.findElement(By.css(`#category option[value='${testCase.categoryInput}']`));
await categoryInput.click();
await driver.sleep(500);

const receiptUrlInput = await driver.findElement(By.id("receipt-url"));
await receiptUrlInput.clear();
await receiptUrlInput.sendKeys(testCase.receiptUrlInput);
await driver.sleep(500);

const descriptionInput = await driver.findElement(By.id("description"));
await descriptionInput.clear();
await descriptionInput.sendKeys(testCase.descriptionInput);
await driver.sleep(500);

// Submit the form
let submitButton = await driver.findElement(By.css('#expense-form .btn'));
await submitButton.click();
await driver.sleep(1000); 

let okButton = await driver.wait(
    until.elementLocated(By.css('.swal2-confirm.swal2-styled')),
    5000 // Timeout after 5 seconds
);
await driver.wait(until.elementIsVisible(okButton), 5000);
await okButton.click();
await driver.sleep(1000);

}

testAddExpense();