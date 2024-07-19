import { BoardDetailPage } from './po/board-detail.page.po';
import { HomePage } from "./po/home.page.po";

describe('Board', () => {
  let home = new HomePage();
  let boardDetail = new BoardDetailPage();

  beforeEach(() => {
    home.visit();
    home.fillBoardName('first board');
    boardDetail = home.clickCreate();
  });

  it('Can be created and open immediately', () => {
    boardDetail.screenshot();

  });

  it ('Can be zoom', () => {
    boardDetail.zoom(4);
    boardDetail.screenshot();
  });
})