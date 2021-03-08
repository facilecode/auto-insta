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

  likeImages: async(n) => {
    await insta.page.waitForSelector('img[style="object-fit: cover;"]');
    
    //const links = await insta.page.evaluate(() => Array.from(document.querySelectorAll("article > div > div > div > div > a > div > div > img"), e => e));
    // const links = await insta.page.$("article > div > div > div > div > a > div > div > img");
    //const n_links = links.slice(0, n);
    await insta.page.waitForTimeout(1000);
    
    // scroll down
    await insta.page.mouse.wheel({ deltaY: 1000 });
    
    await insta.page.waitForTimeout(2000);

    const links = await insta.page.$$('img[style="object-fit: cover;"]');

    // make sure that n is not greater than links.length
    // get n random images from the links images
    const randomImgIndeces = Array.from({length: n}, () => Math.floor(Math.random() * n));

    // get only unique images
    const uniqueImg = [...new Set(randomImgIndeces)];

    
    uniqueImg.forEach((img) => {
      // like the image
      insta.likeSingleImage(links[img]);

      // wait for 2 seconds
      insta.page.waitForTimeout(2000);

      // close the image preview
      // insta.closeImagePreview();
    });


    for (let i = 0; i < n; i++) {
      let randImg = Math.floor(Math.random() * links.length);

      links[randImg].click();
    }
    
    debugger;
    // wait for images to load

    // All images
    // document.querySelectorAll('img[style="object-fit: cover;"]')

    
    // await insta.page.waitForTimeout(2000);
    
    // await links[0].click();
    
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

  likeSingleImage: async (img) => {

    // open image preview
    img.click();

    // wait for 2 seconds
    await insta.page.waitForTimeout(2000);

     /**
      * by selecting a publication via 'Like' label, 
      * we ensure that a liked image won't be unliked 
      * when image is already liked aria-label = Unlike
      */
    await insta.page.waitForSelector("svg[aria-label='Like']");
    const likeSvg = await insta.page.$("svg[aria-label='Like']");
    const likeButton = await likeSvg.getProperty('parentNode');

    // like the image
    likeButton.click();
  }

}

module.exports = insta;