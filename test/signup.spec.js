const { test, expect } = require("@playwright/test");

test.describe("Signup Test", () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto("./signup");
  });

  test.afterAll(async () => {
    await page.close();
  });

  const testCases = [
    // NO FIRST NAME
    {
      testName: "No first name (stay in signup)",
      firstNameInput: "",
      lastNameInput: "Robles",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "Jhoanna1.",
      emailInput: "jhoanna@gmail.com",
      isValid: false,
    },
    // NO LAST NAME
    {
      testName: "No last name (stay in signup)",
      firstNameInput: "Jhoanna",
      lastNameInput: "",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "Jhoanna1.",
      emailInput: "jhoanna@gmail.com",
      isValid: false,
    },
    // NO USERNAME
    {
      testName: "No username (stay in signup)",
      firstNameInput: "Jhoanna",
      lastNameInput: "Robles",
      usernameInput: "",
      passwordInput: "Jhoanna1.",
      emailInput: "jhoanna@gmail.com",
      isValid: false,
    },
    // NO PASSWORD
    {
      testName: "No password (stay in signup)",
      firstNameInput: "Jhoanna",
      lastNameInput: "Robles",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "",
      emailInput: "jhoanna@gmail.com",
      isValid: false,
    },
    // INVALID PASSWORD
    {
      testName: "Invalid password (stay in signup)",
      firstNameInput: "Jhoanna",
      lastNameInput: "Robles",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "12345678",
      emailInput: "jhoanna@gmail.com",
      isValid: false,
    },
    // NO EMAIL
    {
      testName: "No email (stay in signup)",
      firstNameInput: "Jhoanna",
      lastNameInput: "Robles",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "Jhoanna1.",
      emailInput: "",
      isValid: false,
    },
    // INVALID EMAIL
    {
      testName: "Invalid email (stay in signup)",
      firstNameInput: "Jhoanna",
      lastNameInput: "Robles",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "Jhoanna1.",
      emailInput: "jho",
      isValid: false,
    },
    // VALID USER
    {
      testName: "Valid user (redirect to login)",
      firstNameInput: "Jhoanna",
      lastNameInput: "Robles",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "Jhoanna1.",
      emailInput: "jhoanna@gmail.com",
      isValid: true,
    },
    // USER ALREADY EXISTS
    {
      testName: "User already exists (stay in signup)",
      firstNameInput: "Jhoanna",
      lastNameInput: "Robles",
      usernameInput: "Jhoanna_Robles",
      passwordInput: "Jhoanna1.",
      emailInput: "jhoanna@gmail.com",
      isValid: false,
    },
  ];

  testCases.forEach((testCase) => {
    test(`"${testCase.testName}"`, async () => {
      await page.goto("./signup");

      await page.fill("#first-name", testCase.firstNameInput);
      await page.fill("#last-name", testCase.lastNameInput);
      await page.fill("#username", testCase.usernameInput);
      await page.fill("#password", testCase.passwordInput);
      await page.fill("#email", testCase.emailInput);

      await page.click(".action-button");

      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      if (testCase.isValid) {
        expect(currentUrl).toBe("http://localhost:3000/login");
      } else {
        expect(currentUrl).toBe("http://localhost:3000/signup");
      }
    });
  });
});
