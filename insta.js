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
  closeImagePreview: async() => {
    const closeSvg = await insta.page.$("svg[aria-label='Close']");
    const closeButton = await closeSvg.getProperty('parentNode');
    closeButton.click();
  },

  isLiked: async() => {
    const res = await insta.page.$eval("svg[height='24']", e => e.outerHTML);
   
    if (res.includes('Unlike')) {
      console.log("already liked");
    }
    else{
     console.log("not liked");
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

    
    // uniqueImg.forEach(async (img) => {
    //   console.log("================================");
    //   console.log("img n°: ", img);
    //   console.log("================================");
    //   await insta.page.waitForTimeout(2000);
    //   // like the image
    //   await insta.likeSingleImage(links[img]);

    //   // wait for 2 seconds
    //   await insta.page.waitForTimeout(2000);
      
    //   // close the image preview
    //   await insta.closeImagePreview();
    // });

    if (n < links.length) {
      for (let i = 0; i < uniqueImg.length; i++) {
        await insta.page.waitForTimeout(2000);
        // like the image
        const isLikable = await insta.likeSingleImage(links[i]);

        console.log("================================");
        console.log("img n°: ", i+1);
        console.log("================================");

        if (!isLikable) {
          await insta.page.waitForTimeout(1000);
          await insta.closeImagePreview();
          continue
        };
      
        // wait for 2 seconds
        await insta.page.waitForTimeout(2000);
        
        // close the image preview
        await insta.closeImagePreview();
      }
    } else {
      console.log("================================");
      console.error("Please lower the value of n");
      console.log("================================");
    };

    // close the page
    await insta.page.close();
    // close the browser
    await insta.browser.close();
    
    // debugger;
    // wait for images to load

    // All images
    // document.querySelectorAll('img[style="object-fit: cover;"]')

    
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
    // await insta.page.waitForSelector("svg[aria-label='Like']");

    // if the image has already been liked, skip it
    let likeSvg = await insta.page.$("svg[aria-label='Unlike']");

    if (likeSvg) {
      return 0;
    } else {
      likeSvg = await insta.page.$("svg[aria-label='Like']");
    }

    const likeButton = await likeSvg.getProperty('parentNode');

    // like the image
    likeButton.click();
  }

}

module.exports = insta;