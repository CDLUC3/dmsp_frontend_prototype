// enable TypeScript and IntelliSense support for Cypress
/// <reference types="cypress" />


describe('Login', () => {
  it('Should log in an existing user', () => {

    // I need to run the test like this because Cypress wasn't picking up on the 
    // CsrfContext adding the token to the header
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
        });
      });
  })
})