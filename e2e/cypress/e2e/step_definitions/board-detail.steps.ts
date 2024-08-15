import { Then } from "cypress-cucumber-preprocessor/steps";
import { BoardDetailPage } from "../po/board-detail.page.po";

const boardDetail = new BoardDetailPage()

Then('The snapshot of the board should remain the same', () => {
   boardDetail.screenshot();
});