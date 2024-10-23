const { Builder, By, until } = require("selenium-webdriver");
const path = require("path");
const assert = require("assert");

async function testSignup() {
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

    // Function to navigate back to the signup page
    async function navigateToSignup() {
      await driver.get("http://localhost:3000/signup");
      await driver.sleep(1000); // Wait for the page to load
    }

    await navigateToSignup(); // Initial navigation to signup page

    const firstNameInput = await driver.findElement(By.id("first-name"));
    const lastNameInput = await driver.findElement(By.id("last-name"));
    const usernameInput = await driver.findElement(By.id("username"));
    const passwordInput = await driver.findElement(By.id("password"));
    const emailInput = await driver.findElement(By.id("email"));
    const signupButton = await driver.findElement(By.css(".action-button"));

    const testCases = [
      // NO FIRST NAME
      {
        firstNameInput: "",
        lastNameInput: "Robles",
        usernameInput: "Jhoanna_Robles",
        passwordInput: "Jhoanna1.",
        emailInput: "jhoanna@gmail.com",
        isValid: false,
      },
      // NO LAST NAME
      {
        firstNameInput: "Jhoanna",
        lastNameInput: "",
        usernameInput: "Jhoanna_Robles",
        passwordInput: "Jhoanna1.",
        emailInput: "jhoanna@gmail.com",
        isValid: false,
      },
      // NO USERNAME
      {
        firstNameInput: "Jhoanna",
        lastNameInput: "Robles",
        usernameInput: "",
        passwordInput: "Jhoanna1.",
        emailInput: "jhoanna@gmail.com",
        isValid: false,
      },
      // NO PASSWORD
      {
        firstNameInput: "Jhoanna",
        lastNameInput: "Robles",
        usernameInput: "Jhoanna_Robles",
        passwordInput: "",
        emailInput: "jhoanna@gmail.com",
        isValid: false,
      },
      // INVALID PASSWORD
      {
        firstNameInput: "Jhoanna",
        lastNameInput: "Robles",
        usernameInput: "Jhoanna_Robles",
        passwordInput: "12345678",
        emailInput: "jhoanna@gmail.com",
        isValid: false,
      },
      // NO EMAIL
      {
        firstNameInput: "Jhoanna",
        lastNameInput: "Robles",
        usernameInput: "Jhoanna_Robles",
        passwordInput: "Jhoanna1.",
        emailInput: "",
        isValid: false,
      },
      // INVALID EMAIL
      {
        firstNameInput: "Jhoanna",
        lastNameInput: "Robles",
        usernameInput: "Jhoanna_Robles",
        passwordInput: "Jhoanna1.",
        emailInput: "jho",
        isValid: false,
      },
      // VALID USER
      {
        firstNameInput: "Jhoanna",
        lastNameInput: "Robles",
        usernameInput: "Jhoanna_Robles",
        passwordInput: "Jhoanna1.",
        emailInput: "jhoanna@gmail.com",
        isValid: true,
      },
      // USER ALREADY EXISTS
      {
        firstNameInput: "Jhoanna",
        lastNameInput: "Robles",
        usernameInput: "Jhoanna_Robles",
        passwordInput: "Jhoanna1.",
        emailInput: "jhoanna@gmail.com",
        isValid: false,
      },
    ];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];

      const firstNameInput = await driver.findElement(By.id("first-name"));
      await firstNameInput.clear();
      await firstNameInput.sendKeys(testCase.firstNameInput);
      await driver.sleep(1000);

      const lastNameInput = await driver.findElement(By.id("last-name"));
      await lastNameInput.clear();
      await lastNameInput.sendKeys(testCase.lastNameInput);
      await driver.sleep(1000);

      const usernameInput = await driver.findElement(By.id("username"));
      await usernameInput.clear();
      await usernameInput.sendKeys(testCase.usernameInput);
      await driver.sleep(1000);

      const passwordInput = await driver.findElement(By.id("password"));
      await passwordInput.clear();
      await passwordInput.sendKeys(testCase.passwordInput);
      await driver.sleep(1000);

      const emailInput = await driver.findElement(By.id("email"));
      await emailInput.clear();
      await emailInput.sendKeys(testCase.emailInput);
      await driver.sleep(1000);

      const signupButton = await driver.findElement(By.css(".action-button"));
      await signupButton.click();
      await driver.sleep(2000);

      // Check if the URL has changed
      const currentUrl = await driver.getCurrentUrl();
      if (
        currentUrl !== "http://localhost:3000/signup" &&
        testCase.isValid === true
      ) {
        await navigateToSignup(); // Navigate back to the signup page for the next test
      }

      try {
        if (testCase.isValid) {
          assert.strictEqual(
            currentUrl,
            "http://localhost:3000/login",
            `Expected to navigate to login on valid input for case ${i + 1}`
          );
        } else {
          assert.strictEqual(
            currentUrl,
            "http://localhost:3000/signup",
            `Expected to remain on signup for invalid input for case ${i + 1}`
          );
        }
      } catch (err) {
        console.error(`Error for test case ${i + 1}: ${err.message}`);
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

testSignup();
