export class ToolBar {
    clickTextInput() {
        this._getToolbar()
            .get('[data-cy=option-text-input]')
            .click();
    }

    clickPencil() {
        this._getToolbar()
            .get('[data-cy=option-pencil]')
            .click();
    }

    private _getToolbar() {
        return cy.get('[data-cy=tool-bar]')
            .should('exist');
    }

    clickStickyNote() {
        this._getToolbar()
            .get('[data-cy=option-stickynote]')
            .click();
    }

    clickMove() {
        this._getToolbar()
            .get('[data-cy=option-]')
            .click();
    }
}