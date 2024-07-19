import { HomePage } from "./po/home.page.po";

describe('Board', () => {
  it('Can be created and open immediately', () => {
    const home = new HomePage();
    home.visit();
    home.fillBoardName('first board');
    var boardDetail = home.clickCreate();
    boardDetail.screenshot();
  })
})