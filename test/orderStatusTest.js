const { Builder, By, until } = require("selenium-webdriver");
const path = require("path");
const assert = require("assert");
const OrderInfo = require("../src/models/OrderInfo");

const mongoose = require("mongoose");

// fetch order counts from db
async function OrderCountsDB() {
  try {
    await mongoose.connect("mongodb://0.0.0.0:27017/abstrak");

    const processingCount = await OrderInfo.find({
      fulfillmentStatus: "Unfulfilled",
    }).countDocuments();
    const toBeShippedCount = await OrderInfo.find({
      fulfillmentStatus: "Fulfilled",
    }).countDocuments();
    const cancelledCount = await OrderInfo.find({
      fulfillmentStatus: "Canceled",
    }).countDocuments();

    return {
      processing: processingCount,
      toBeShipped: toBeShippedCount,
      cancelled: cancelledCount,
    };
  } catch (err) {
    console.error("Error fetching data from MongoDB:", err);
  }
}

async function testOrderStatus() {
  let driver;

  try {
    // Set up Chrome options
    const options = new chrome.Options();
    options.addArguments("--headless"); // Run in headless mode
    options.addArguments("--no-sandbox"); // Bypass OS security model
    options.addArguments("--disable-dev-shm-usage"); // Overcome limited resource problems

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options) // Set the Chrome options here
      .build();

    // log in
    await driver.get("http://localhost:3000/login");
    const usernameInput = await driver.findElement(By.id("username"));
    await usernameInput.sendKeys("Max_Verstappen");
    await driver.sleep(2000);

    const passwordInput = await driver.findElement(By.id("password"));
    await passwordInput.sendKeys("12345678");
    await driver.sleep(2000);

    const loginButton = await driver.findElement(By.css(".action-button"));
    await loginButton.click();
    await driver.sleep(2000);

    const processingElement = await driver.findElement(By.id("processing"));
    const toBeShippedElement = await driver.findElement(By.id("to-be-shipped"));
    const cancelledElement = await driver.findElement(By.id("cancelled"));

    const processingCountDashboard = parseInt(
      await processingElement.getText()
    );
    const toBeShippedCountDashboard = parseInt(
      await toBeShippedElement.getText()
    );

    const cancelledCountDashboard = parseInt(await cancelledElement.getText());

    const orderCountsDB = await OrderCountsDB();
    await mongoose.disconnect();

    console.log("DB Order Counts:", orderCountsDB);
    console.log("Dashboard Counts:", {
      processing: processingCountDashboard,
      toBeShipped: toBeShippedCountDashboard,
      cancelled: cancelledCountDashboard,
    });

    // checks if db count === dashboard count
    assert.strictEqual(
      processingCountDashboard,
      orderCountsDB.processing,
      "Processing count does not match!"
    );
    assert.strictEqual(
      toBeShippedCountDashboard,
      orderCountsDB.toBeShipped,
      "To be shipped count does not match!"
    );
    assert.strictEqual(
      cancelledCountDashboard,
      orderCountsDB.cancelled,
      "Cancelled count does not match!"
    );

    console.log("Counts match between MongoDB and Dashboard!");
  } catch (error) {
    console.error("Error occurred:", error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

testOrderStatus();
