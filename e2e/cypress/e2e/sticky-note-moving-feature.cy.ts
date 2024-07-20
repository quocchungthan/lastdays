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

  it('Can show stickynote placeholder', () => {
    boardDetail.getToolBar()
        .clickStickyNote();
    boardDetail.hoverMouseToALineTo({x: 300, y: 300});
    boardDetail.hoverMouseToALineTo({x: 600, y: 95});
    boardDetail.screenshot();

  });
})