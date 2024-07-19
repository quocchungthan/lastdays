import { BASE_URL } from "../../support/constants";

export class BoardDetailPage {
    visit(id: string) {
        cy.visit(BASE_URL + '/board/' + id);

        return this;
    }

    async screenshot() {
        cy.matchImageSnapshot({
            failureThreshold: 0.4
        });
    }
}