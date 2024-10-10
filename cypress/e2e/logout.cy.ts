// enable TypeScript and IntelliSense support for Cypress
/// <reference types="cypress" />


describe('Logout test on Desktop', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  })

  it('should redirect users after logging out', () => {

    //First log in
    cy.request('http://localhost:4000/apollo-csrf')
      .then((response) => {
        const csrfToken = response.headers['x-csrf-token'];

        // Log the token (you can check it in Cypress's command log)
        cy.log(`CSRF Token: ${csrfToken}`);

        // Now use the token in your subsequent request
        cy.request({
          method: 'POST',
          url: 'http://localhost:4000/apollo-signin',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          body: {
            email: 'admin@colorado.edu',
            password: 'Password123$9'
          }
        }).then((signinResponse) => {
          // If you want to make the entire response object available in the Cypress command log
          cy.wrap(signinResponse).as('signinResponse');

          cy.wrap(signinResponse).its('status').should('equal', 200);

          // Check that cookies were added
          cy.getCookie('dmspt').should('exist')
          cy.getCookie('dmspr').should('exist')

          //Go to home page
          cy.visit('http://localhost:3000');

          // Click logout button
          cy.get('[data-method="delete"]').click();

          // Verify redirect to login page
          cy.url().should('include', '/login');
        });
      });
  })
})

describe('Logout test on mobile', () => {
  beforeEach(() => {
    cy.viewport(375, 667);
  })

  it('should delete cookies after logging out', () => {

    //First log in
    cy.request('http://localhost:4000/apollo-csrf')
      .then((response) => {
        const csrfToken = response.headers['x-csrf-token'];

        // Log the token (you can check it in Cypress's command log)
        cy.log(`CSRF Token: ${csrfToken}`);

        // Now use the token in your subsequent request
        cy.request({
          method: 'POST',
          url: 'http://localhost:4000/apollo-signin',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          body: {
            email: 'admin@colorado.edu',
            password: 'Password123$9'
          }
        }).then((signinResponse) => {
          // If you want to make the entire response object available in the Cypress command log
          cy.wrap(signinResponse).as('signinResponse');

          cy.wrap(signinResponse).its('status').should('equal', 200);

          // Check that cookies were added
          cy.getCookie('dmspt').should('exist')
          cy.getCookie('dmspr').should('exist')

          //Go to home page
          cy.visit('http://localhost:3000');

          // Open dropdown menu from hamburger icon
          cy.get('.mobile-icon').click();

          //Click logout button
          cy.get('#mobile-navigation [data-method="delete"]').click();

          // Verify redirect to login page
          cy.url().should('include', '/login');
        });
      });
  })
})