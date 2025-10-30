// enable TypeScript and IntelliSense support for Cypress
/// <reference types="cypress" />


// Base configuration
const baseUrl = Cypress.env('BASE_URL') || 'http://localhost:3000';
const email = Cypress.env('TEST_USER_EMAIL') || 'super@example.com';
const password = Cypress.env('TEST_USER_PASSWORD') || 'Password123$9';

describe('Authentication flow tests', () => {

  beforeEach(() => {
    // Clear before each run and ignore React hydration errors if any
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.on('uncaught:exception', (err) => {
      if (/Hydration failed/.test(err.message)) {
        return false;
      }
      if (/Failed to execute 'removeChild'/.test(err.message)) {
        return false;
      }
      return undefined;
    });
  });

  describe('Logout functionality on desktop', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
    })
    it('should redirect user after logging out on desktop', () => {
      // First make sure the user is logged in
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

      // Wait for login cookies and redirect to complete
      // Without relying on cookies or navigation, wait for logout button in Header
      cy.get('[data-testid="logoutButtonDesktop"]', { timeout: 10000 }).should('be.visible').click();

      // Verify redirect to login page
      cy.url().should('include', '/login');
    });
  });

  describe('Logout test on mobile', () => {
    beforeEach(() => {
      cy.viewport(375, 667);
    })

    it('should redirect users after logging out on mobile', () => {

      // First make sure the user is logged in
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

      // Wait for login cookies and redirect to complete
      // Open dropdown menu from hamburger icon
      cy.get('#mobile-menu-open').click();
      // Ensure the mobile menu has finished its slide-in transition
      cy.get('#mobile-navigation')
        .should('be.visible')
        .and('have.css', 'right', '0px');

      //Click logout button (mobile) without relying on cookies
      cy.get('#mobile-navigation [data-testid="logoutButtonMobile"]', { timeout: 10000 })
        .scrollIntoView()
        .should('be.visible')
        .click();

      // Verify redirect to login page
      cy.url().should('include', '/login');
    });
  });
})

