/// <reference types="cypress" />

function generateUniqueUser() {
  const timestamp = new Date().getTime();
  return {
    email: `user${timestamp}@example.com`,
    password: 'Password123$9',
    acceptedTerms: 1
  };
}

describe('Signup', () => {
  it('Should sign up a new user', () => {

    const newUser = generateUniqueUser();

    cy.visit('http://localhost:3000/signup')

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
          url: 'http://localhost:4000/apollo-signup',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
          },
          body: newUser,
        }).then((signupResponse) => {
          // If you want to make the entire response object available in the Cypress command log
          cy.wrap(signupResponse).as('signupResponse');

          cy.wrap(signupResponse).its('status').should('equal', 201);

          // Check that cookies were added
          cy.getCookie('dmspt').should('exist')
          cy.getCookie('dmspr').should('exist')
        });
      });
  })
})