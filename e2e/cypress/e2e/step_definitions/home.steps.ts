import { When } from "cypress-cucumber-preprocessor/steps";
import { HomePage } from "../po/home.page.po";

const home = new HomePage()

When('I open the home page', () => {
   home.visit();
});

When(`I input {string} the board name and click submit`, (boardName: string) => {
   home.fillBoardName(boardName);
   home.clickCreate();
});