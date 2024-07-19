import { BASE_URL } from "../../support/constants";

export class HomePage {
    visit() {
        cy.visit(BASE_URL + '/home');

        return this;
    }

    fillBoardName(content: string) {
        cy.get('input[data-cy=board-name-input]')
            .should('exist')
            .type(content);
    }
}