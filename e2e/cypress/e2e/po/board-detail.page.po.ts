import { BASE_URL } from "../../support/constants";
import { ToolBar } from './toolbar.po';
export interface Point {
    x: number;
    y: number;
}
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
                bubbles: true,
                animationDistanceThreshold: 0.2 });
        cy.wait(500);
    }

    
    click(position: Point) {
        cy.get('[data-cy=drawing-container]')
            .click(position.x, position.y);
        cy.wait(500);
    }

    getToolBar() {
        return new ToolBar();
    }

    hoverMouseToALineTo(to: Point) {
        const container = cy.get('[data-cy=drawing-container]')
            .get('canvas')
            .eq(0);

        this._performMouseOver(container, to);
    }

    pressMouseToALineForm(from: Point, to: Point) {
        const container = cy.get('[data-cy=drawing-container]')
            .get('canvas')
            .eq(0);

        this._performMousePress(container, from, to);
    }

    private _performMousePress(container: Cypress.Chainable<JQuery<HTMLElement>>, from: Point, to: Point) {
        container.trigger("mouseover", from.x, from.y, { force: true, animationDistanceThreshold: 20 })
            .trigger('mousedown', from.x, from.y, { force: true, animationDistanceThreshold: 20 })
            .trigger('mousemove', to.x, to.y, { force: true, animationDistanceThreshold: 20 })
            .trigger('mouseup', { force: true });
        cy.wait(500);
    }

    private _performMouseOver(container: Cypress.Chainable<JQuery<HTMLElement>>, to: Point) {
        container.trigger('mousemove', to.x, to.y, { force: true, animationDistanceThreshold: 20 });
        cy.wait(500);
    }
}