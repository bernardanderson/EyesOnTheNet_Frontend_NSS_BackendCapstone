import { EyesonthenetFePage } from './app.po';

describe('eyesonthenet-fe App', function() {
  let page: EyesonthenetFePage;

  beforeEach(() => {
    page = new EyesonthenetFePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
