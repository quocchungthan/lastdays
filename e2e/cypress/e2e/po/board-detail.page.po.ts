import { BASE_URL } from "../../support/constants";

export class BoardDetailPage {
    visit(id: string) {
        cy.visit(BASE_URL + '/board/' + id);

        return this;
    }

    screenshot() {
        cy.matchImageSnapshot({
            failureThreshold: 0.2
        });
    }

    zoom(speed: number) {
        cy.get('body')
            .trigger('mousemove',  200, 200);
        cy.wait(500);
        cy.get('body')
            .trigger("wheel", { 
                deltaY: -66.666666 * speed, 
                wheelDelta: 120 * speed, 
                wheelDeltaX: 0 * speed, 
                wheelDeltaY: 120 * speed, 
                bubbles: true});
        cy.wait(500);
    }
}