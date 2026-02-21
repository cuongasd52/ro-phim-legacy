describe('Authentication & Admin Role UI Tests', () => {
    const BASE_URL = 'http://localhost:5173'; // Default Vite port

    beforeEach(() => {
        // Go to the home page before each test
        cy.visit(BASE_URL);
    });

    it('Should successfully log in as a regular USER and verify restrict UI', () => {
        // 1. Navigate to Login Page
        cy.get('button').contains('Login').click();
        cy.url().should('include', '/login');

        // 2. Fill in the login form with regular user credentials
        // TODO: Replace with an actual regular user's credentials from your DB
        cy.get('input[type="email"]').type('cuongproek52@gmail.com');
        cy.get('input[type="password"]').type('123456');

        // 3. Submit the login form
        cy.get('button[type="submit"]').contains('Sign In').click();

        // 4. Verify Successful Login (Redirected to Home)
        cy.url().should('eq', `${BASE_URL}/`);
        cy.contains('Hello,').should('be.visible');

        // 5. Verify UI Restrictions
        // Regular users should NOT see the "Add Movie" link in the header
        cy.contains('Add Movie').should('not.exist');

        // Regular users should NOT see the meatball menu (dropdown) on movie cards
        cy.get('.movie-card').first().within(() => {
            cy.get('.dropdown-toggle').should('not.exist');
        });
    });

    it('Should successfully log in as an ADMIN and verify Admin UI options', () => {
        // 1. Navigate to Login Page
        cy.get('button').contains('Login').click();

        // 2. Fill in the login form with ADMIN credentials
        // TODO: Replace with an actual admin's credentials from your DB
        cy.get('input[type="email"]').type('test@gmail.com');
        cy.get('input[type="password"]').type('123456');

        // 3. Submit the login form
        cy.get('button[type="submit"]').contains('Sign In').click();

        // 4. Verify Successful Login
        cy.url().should('eq', `${BASE_URL}/`);

        // 5. Verify Admin specific elements in the Header
        cy.contains('ADMIN').should('be.visible');
        cy.contains('Add Movie').should('be.visible');

        // 6. Verify Admin specific elements on the Movie Cards (Meatball Menu)
        cy.get('.movie-card').should('have.length.greaterThan', 0);
        cy.get('.movie-card').first().within(() => {
            // Find and click the meatball menu (⋮)
            cy.get('.dropdown-toggle').should('exist').click();

            // Verify the admin actions exist inside the dropdown menu
            cy.contains('Edit Movie').should('be.visible');
            cy.contains('Delete Movie').should('be.visible');
        });
    });

    it('Should show an error for invalid login credentials', () => {
        cy.visit(`${BASE_URL}/login`);

        cy.get('input[type="email"]').type('wrongemail@example.com');
        cy.get('input[type="password"]').type('wrongpassword');
        cy.get('button[type="submit"]').contains('Sign In').click();

        // Verify that the error alert banner appears on the login page
        cy.get('.alert-danger').should('be.visible');
    });
});
