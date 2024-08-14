import { BoardDetailPage } from "./po/board-detail.page.po";
import { HomePage } from "./po/home.page.po";

describe("Text Input Dialog", () => {
  let home = new HomePage();
  let boardDetail = new BoardDetailPage();

  beforeEach(() => {
    home.visit();
    home.fillBoardName("first board");
    boardDetail = home.clickCreate();
  });

  it("can be open", () => {
    
  });

  it("auto focus on the editor on open", () => {
    
  });

  it("adjust the text color", () => {
    
  });

  it("adjust the text size", () => {
    
  });

  it("can be cancel", () => {
    
  });
});
