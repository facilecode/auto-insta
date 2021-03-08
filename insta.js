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
    // if connection is bad, we should way til elements appear
    await insta.page.waitForSelector('input[name="username"]');
    await insta.page.waitForSelector('input[name="password"]');

    let loginBtn = await insta.page.$('button[type="submit"]');
    
    // imitate human waiting
    insta.page.waitForTimeout(1000);

    await insta.page.type('input[name="username"]', username, {delay: 100});
    await insta.page.type('input[name="password"]', password, {delay: 100});
    
    await loginBtn.click();

    // debugger;
  },

  goToHashtagPage: async(tag) => {
    /* 
     * Easy way of doing but also easily identifiable as bot
     * await insta.page.goto("https://www.instagram.com/explore/tags/" + tag + "/")
     */
    await insta.page.waitForSelector('input[placeholder="Search"]');

    await insta.page.type('input[placeholder="Search"]', '#'+tag, {delay: 100});

    await insta.page.waitForSelector(`a[href="/explore/tags/${tag}/"]`);

    const link = await insta.page.$(`a[href="/explore/tags/${tag}/"]`);
    
    if (link) {
        await link.click();
    } else {
        console.log('no hashtag found')
    }
  },

  /*
   * When we are done liking an image
   * we close the view
   */
  closeImageView: async() => {
    const closeSvg = await insta.page.$("svg[aria-label='Close']");
    const closeButton = await closeSvg.getProperty('parentNode');
    closeButton.click();
  },

  likeImages: async(n) => {
    await insta.page.waitForSelector('img[style="object-fit: cover;"]');
    
    //const links = await insta.page.evaluate(() => Array.from(document.querySelectorAll("article > div > div > div > div > a > div > div > img"), e => e));
    // const links = await insta.page.$("article > div > div > div > div > a > div > div > img");
    const links = await insta.page.$$('img[style="object-fit: cover;"]');
    //const n_links = links.slice(0, n);
    await insta.page.waitForTimeout(2000);

    // scroll down
    await insta.page.mouse.wheel({ deltaY: 1000 });
   
    // wait for images to load

    // All images
    //document.querySelectorAll('img[style="object-fit: cover;"]')

    
    // await insta.page.waitForTimeout(2000);
    
    
    // // when image is already liked aria-label = Unlike
    
    // await insta.page.waitForTimeout(4000);

    // /* 
    //  * by selecting a publication via 'Like' label, 
    //  * we ensure that a liked image won't be unliked
    //  */
    // await insta.page.waitForSelector("svg[aria-label='Like']");
    // const likeSvg = await insta.page.$("svg[aria-label='Like']");
    // const likeButton = await likeSvg.getProperty('parentNode');

    // likeButton.click();

    
  },

}

module.exports = insta;