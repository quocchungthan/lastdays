import { When } from "cypress-cucumber-preprocessor/steps";
import { ToolBar } from "../po/toolbar.po";

When('I click at the logo', () => {
   cy.get('#topbar .main-logo ')
      .should('exist')
      .should('be.visible')
      .click();
});

When('I click at pencil tool', () => {
   new ToolBar().clickPencil();
});