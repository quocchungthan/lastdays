import { BoardDetailPage } from "./po/board-detail.page.po";
import { HomePage } from "./po/home.page.po";

describe("Text", () => {
  let home = new HomePage();
  let boardDetail = new BoardDetailPage();

  beforeEach(() => {
    home.visit();
    home.fillBoardName("first board");
    boardDetail = home.clickCreate();
  });

  it("can be pasted on the Board", () => {
    
  });

  it("can attach to a sticky note", () => {
    
  });
});
