export class ToolBar {
    clickPencil() {
        cy.get('[data-cy=tool-bar]')
            .should('exist')
            .get('[data-cy=option-pencil]')
            .click();
    }

    clickStickyNote() {
        cy.get('[data-cy=tool-bar]')
            .should('exist')
            .get('[data-cy=option-stickynote]')
            .click();
    }

    clickMove() {
        cy.get('[data-cy=tool-bar]')
            .should('exist')
            .get('[data-cy=option-]')
            .click();
    }
}