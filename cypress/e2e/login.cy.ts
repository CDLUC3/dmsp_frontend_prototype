// enable TypeScript and IntelliSense support for Cypress
/// <reference types="cypress" />

describe('Authentication flow tests', () => {
  // Base configuration
  const baseUrl = Cypress.env('BASE_URL') || 'http://localhost:3000';

  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Login functionality', () => {
    it('logs in successfully with valid credentials', () => {
      // Visit login page
      cy.visit(`${baseUrl}/en-US/login`);

      // Step 1: Enter email
      cy.get('[data-testid="emailInput"]')
        .should('be.visible')
        .type(Cypress.env('TEST_USER_EMAIL'));

      cy.get('[data-testid="actionContinue"]')
        .should('be.enabled')
        .click();

      // Step 2: Enter password
      cy.get('[data-testid="passInput"]')
        .should('be.visible')
        .type(Cypress.env('TEST_USER_PASSWORD'), { log: false }); // hide password in logs

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

