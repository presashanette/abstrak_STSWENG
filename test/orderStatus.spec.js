import { test, expect } from "@playwright/test";
import mongoose from "mongoose";
import OrderInfo from "../src/models/OrderInfo";

async function OrderCountsDB() {
  try {
    await mongoose.connect("mongodb://0.0.0.0:27017/abstrak");

    const processingCount = await OrderInfo.countDocuments({
      fulfillmentStatus: "Unfulfilled",
    });
    const toBeShippedCount = await OrderInfo.countDocuments({
      fulfillmentStatus: "Fulfilled",
    });
    const cancelledCount = await OrderInfo.countDocuments({
      fulfillmentStatus: "Canceled",
    });

    return {
      processing: processingCount,
      toBeShipped: toBeShippedCount,
      cancelled: cancelledCount,
    };
  } catch (err) {
    console.error("Error fetching data from MongoDB:", err);
    return null;
  }
}

test.describe("Order Status Test", () => {
  let orderCountsDB;
  let processingCountDashboard;
  let toBeShippedCountDashboard;
  let cancelledCountDashboard;

  test.beforeEach(async ({ page }) => {
    await page.goto("./login");
    await page.fill("#username", "Abstrak_Admin");
    await page.fill("#password", "TOUCH.DOWN!");
    await page.click(".action-button");

    await page.waitForURL("./");

    processingCountDashboard = parseInt(
      await page.locator("#processing").textContent()
    );
    toBeShippedCountDashboard = parseInt(
      await page.locator("#to-be-shipped").textContent()
    );
    cancelledCountDashboard = parseInt(
      await page.locator("#cancelled").textContent()
    );

    orderCountsDB = await OrderCountsDB();
    await mongoose.disconnect();
  });

  test("Processing count from dashboard and DB match.", () => {
    expect(processingCountDashboard).toBe(orderCountsDB.processing);
  });

  test("To be shipped count from dashboard and DB match.", () => {
    expect(toBeShippedCountDashboard).toBe(orderCountsDB.toBeShipped);
  });

  test("Cancelled count from dashboard and DB match.", () => {
    expect(cancelledCountDashboard).toBe(orderCountsDB.cancelled);
  });
});
