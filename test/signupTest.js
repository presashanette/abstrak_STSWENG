const { Builder, By, until } = require("selenium-webdriver");
const path = require("path");

async function testSignup() {
  let driver;

  try {
    driver = await new Builder().forBrowser("chrome").build();

    await driver.get("http://localhost:3000/signup");

    const firstNameInput = await driver.findElement(By.id("first-name"));
    const lastNameInput = await driver.findElement(By.id("last-name"));
    const usernameInput = await driver.findElement(By.id("username"));
    const passwordInput = await driver.findElement(By.id("password"));
    const emailInput = await driver.findElement(By.id("email"));
    const signupButton = await driver.findElement(By.css(".action-button"));

    const testCases = [
      // VALID USER
      {
        firstNameInput: "Jhoanna",
        lastNameInput: "Robles",
        usernameInput: "Jhoanna_Robles",
        passwordInput: "12345678",
        emailInput: "jhoanna@gmail.com",
      },
      // NO FIRST NAME
      {
        firstNameInput: "",
        lastNameInput: "Robles",
        usernameInput: "Jhoanna_Robles",
        passwordInput: "12345678",
        emailInput: "jhoanna@gmail.com",
      },
      // NO LAST NAME
      {
        firstNameInput: "Jhoanna",
        lastNameInput: "",
        usernameInput: "Jhoanna_Robles",
        passwordInput: "12345678",
        emailInput: "jhoanna@gmail.com",
      },
      // NO USERNAME
      {
        firstNameInput: "Jhoanna",
        lastNameInput: "Robles",
        usernameInput: "",
        passwordInput: "12345678",
        emailInput: "jhoanna@gmail.com",
      },
      // NO PASSWORD
      {
        firstNameInput: "Jhoanna",
        lastNameInput: "Robles",
        usernameInput: "Jhoanna_Robles",
        passwordInput: "",
        emailInput: "jhoanna@gmail.com",
      },
      // NO EMAIL
      {
        firstNameInput: "Jhoanna",
        lastNameInput: "Robles",
        usernameInput: "Jhoanna_Robles",
        passwordInput: "12345678",
        emailInput: "",
      },
      // INVALID EMAIL
      {
        firstNameInput: "Jhoanna",
        lastNameInput: "Robles",
        usernameInput: "Jhoanna_Robles",
        passwordInput: "12345678",
        emailInput: "jho",
      },
      // USER ALREADY EXISTS
      {
        firstNameInput: "Max Emilian",
        lastNameInput: "Verstappen",
        usernameInput: "Max_Verstappen",
        passwordInput: "12345678",
        emailInput: "max_emilian_verstappen@gmail.com",
      },
    ];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];

      await firstNameInput.sendKeys(testCase.firstNameInput);
      await driver.sleep(1000);

      await lastNameInput.sendKeys(testCase.lastNameInput);
      await driver.sleep(1000);

      await usernameInput.sendKeys(testCase.usernameInput);
      await driver.sleep(1000);

      await passwordInput.sendKeys(testCase.passwordInput);
      await driver.sleep(1000);

      await emailInput.sendKeys(testCase.emailInput);
      await driver.sleep(1000);

      await signupButton.click();
      await driver.sleep(1000);
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
