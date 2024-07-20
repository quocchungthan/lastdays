import { BoardDetailPage } from './po/board-detail.page.po';
import { HomePage } from "./po/home.page.po";

describe('StickyNote', () => {
  let home = new HomePage();
  let boardDetail = new BoardDetailPage();

  beforeEach(() => {
    home.visit();
    home.fillBoardName('first board');
    boardDetail = home.clickCreate();
  });

  it('Can be sticked and dragged', () => {
    boardDetail.getToolBar()
        .clickStickyNote();
    boardDetail.hoverMouseToALineTo({x: 300, y: 300});
    boardDetail.hoverMouseToALineTo({x: 600, y: 95});
    boardDetail.click({x: 600, y: 95});
    boardDetail.getToolBar()
        .clickStickyNote();
    boardDetail.hoverMouseToALineTo({x: 300, y: 300});
    boardDetail.click({x: 300, y: 300});

    boardDetail.pressMouseToALineForm({x: 600, y: 95}, {x: 610, y: 400});

    boardDetail.screenshot();
  });

  
  it('Can be sticked and dragged with ink attached', () => {
    boardDetail.getToolBar()
        .clickStickyNote();
    boardDetail.hoverMouseToALineTo({x: 300, y: 300});
    boardDetail.hoverMouseToALineTo({x: 600, y: 95});
    boardDetail.click({x: 600, y: 95});
    boardDetail.getToolBar()
        .clickStickyNote();
    boardDetail.hoverMouseToALineTo({x: 300, y: 300});
    boardDetail.click({x: 300, y: 300});
    boardDetail
      .getToolBar()
      .clickPencil();
    boardDetail.pressMouseToALineForm({x: 200, y: 200}, {x: 400, y: 400});
    boardDetail.pressMouseToALineForm({x: 400, y: 400}, {x: 410, y: 30});

    boardDetail.pressMouseToALineForm({x: 610, y: 400}, {x: 640, y: 400});

    boardDetail.getToolBar()
        .clickMove();
    boardDetail.pressMouseToALineForm({x: 600, y: 95}, {x: 610, y: 400});
    boardDetail.pressMouseToALineForm({x: 300, y: 300}, {x: 200, y: 400});

    boardDetail.screenshot();
  });
})