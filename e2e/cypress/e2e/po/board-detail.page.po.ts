import { BASE_URL } from "../../support/constants";

export class BoardDetailPage {
    visit(id: string) {
        cy.visit(BASE_URL + '/board/' + id);

        return this;
    }

    screenshot() {
        cy.get('body').toMatchImageSnapshot({
            imageConfig: {
                threshold: 0.001,
            },
        });
    }
}