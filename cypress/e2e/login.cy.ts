// enable TypeScript and IntelliSense support for Cypress
/// <reference types="cypress" />

describe('Authentication flow tests', () => {
  // Base configuration
  const baseUrl = Cypress.env('BASE_URL') || 'http://localhost:3000';
  const email = Cypress.env('TEST_USER_EMAIL') || 'super@example.com';
  const password = Cypress.env('TEST_USER_PASSWORD') || 'Password123$9';

  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();

    // Ignore React hydration mismatches so tests can proceed
    cy.on('uncaught:exception', (err) => {
      if (/Hydration failed/.test(err.message)) {
        return false;
      }
      // let other errors fail the test
      return undefined;
    });
  });

  describe('Login functionality', () => {
    it('logs in successfully with valid credentials', () => {
      // Visit login page
      cy.visit(`${baseUrl}/en-US/login`);

      // Step 1: Enter email
      cy.get('[data-testid="emailInput"]')
        .should('be.visible')
        .type(email);

      cy.get('[data-testid="actionContinue"]')
        .should('be.enabled')
        .click();

      // Step 2: Enter password
      cy.get('[data-testid="passInput"]')
        .should('be.visible')
        .type(password, { log: false }); // hide password in logs

      cy.get('[data-testid="actionSubmit"]')
        .should('be.enabled')
        .click();

      // Expect to be redirected to homepage or dashboard
      cy.url().should('eq', `${baseUrl}/en-US`);

      // Verify authentication cookies are set
      cy.getCookie('dmspt').should('exist'); // access token
      cy.getCookie('dmspr').should('exist'); // refresh token
    });
  });
});

