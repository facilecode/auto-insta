const puppeteer = require('puppeteer');
const BASE_URL = 'https://www.instagram.com';

const insta = {
  browser: null,
  page: null,

  initialize: async () => {
    insta.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });

    insta.page = await insta.browser.newPage();
    await insta.page.setDefaultNavigationTimeout(0);
    await insta.page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  },

  acceptCookies: async () => {
    const [button] = await insta.page.$x("//button[text()='Accept']");
    await button.click();
  },

  login: async (username, password) => {
    let loginBtn = await insta.page.$('button[type="submit"]');

    insta.page.waitForTimeout(1000);

    await insta.page.type('input[name="username"]', username, {delay: 100});
    await insta.page.type('input[name="password"]', password, {delay: 100});
    
    await loginBtn.click();

    // debugger;
  }
  
}

module.exports = insta;