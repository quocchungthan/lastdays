import { BASE_URL } from "../../support/constants";
import { BoardDetailPage } from "./board-detail.page.po";

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

    clickCreate() {
        cy.get('button[data-cy=create-button]')
            .should('exist')
            .click();
        return new BoardDetailPage();
    }
}