// enable TypeScript and IntelliSense support for Cypress
/// <reference types="cypress" />


// Base configuration
const baseUrl = Cypress.env('BASE_URL') || 'http://localhost:3000';

describe('Authentication flow tests', () => {

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

      //Go to home page
      cy.visit(`${baseUrl}/en-US`);

      // Click logout button
      cy.get('[data-method="delete"]').click();

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

      //Go to home page
      cy.visit(`${baseUrl}/en-US`);

      // Open dropdown menu from hamburger icon
      cy.get('#mobile-menu-open').click();

      //Click logout button
      cy.get('[data-method="mobile-delete"]').click();

      // Verify redirect to login page
      cy.url().should('include', '/login');
    });
  });
})

