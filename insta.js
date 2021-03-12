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
    console.log("In closeImagePreview ...");
    const closeSvg = await insta.page.$("svg[aria-label='Close']");
    const closeButton = await closeSvg.getProperty('parentNode');
    console.log("closeButton.click() ...");
    closeButton.click();
    console.log("closeButton clicked ...");
  },

  /*
   * a function to check whether opened image is liked or not
   */
  isLiked: async() => {
    console.log("isLiked ...")
    // image's like button svg is always bigger that those of comments
    const res = await insta.page.$eval("svg[height='24']", e => e.outerHTML);
   
    if (res.includes('Unlike')) {
      console.log("isLiked(): already liked");
    }
    else{
     console.log("isLiked(): not liked");
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

    // remove duplicate indexes with Set()
    const uniqueImg = [...new Set(randomImgIndeces)];

    if (n < links.length) {
      // forEach doesn't work
      for (let i = 0; i < uniqueImg.length; i++) {
        console.log("in foor loop");
        await insta.page.waitForTimeout(2000);
        // like the image
        const isLikable = await insta.likeSingleImage(links[i]);

        console.log("================================");
        console.log("img n°: ", i+1);
        console.log("================================");

        if (!isLikable) {
          console.log("not likable");
          await insta.page.waitForTimeout(1000);
          console.log("closing image preview (if) ...");
          await insta.closeImagePreview();
          console.log("closed image preview (if)");
          continue
        };
      
        // wait for 2 seconds
        await insta.page.waitForTimeout(2000);
        
        // close the image preview
        console.log("closing image preview ...");
        await insta.closeImagePreview();
        console.log("closed image preview");
      }
    } else {
      console.log("================================");
      console.error("Please lower the value of n");
      console.log("================================");
    };

    console.log("___ ending task ____");

    /* Protocol Error is thrown */
    // close the page
    //await insta.page.close();
    // close the browser
    //await insta.browser.close();
    
  },

  /*
   * This function is called when a publication is previewed
   * we like first n comments
   */
  likeImageComments: async (n) => {
    console.log('likeImageComments()');
    const commentSvgs = await insta.page.$$("svg[aria-label='Like']");
    console.log("commentsSVGs length ", commentSvgs.length);

    for (let i=0; i<n; i++) {
      console.log('comment n°:', i);
      // if we want to like 5 comments while there are only 2
      if (i < commentSvgs.length){
        let likeButton = await commentSvgs[i].getProperty('parentNode');
        likeButton.click();
        await insta.page.waitForTimeout(1000);
      }
      else{
        console.log('No more comments to like');
        return
      }
    }
  },

  likeSingleImage: async (img) => {
    // open image preview
    console.log("opening image");
    img.click();
    console.log("opened");
    // wait for 2 seconds
    await insta.page.waitForTimeout(2000);
    console.log("waited 2 secs");
    /*
     * by selecting a publication via 'Like' label, 
     * we ensure that a liked image won't be unliked 
     * when image is already liked aria-label = Unlike
     */
    // await insta.page.waitForSelector("svg[aria-label='Like']");

    // if the image has already been liked, skip it
    let likeSvg = await insta.page.$("svg[aria-label='Unlike']");

    if (likeSvg) {
      console.log('already liked');
      return 0;
    } else {
      likeSvg = await insta.page.$("svg[aria-label='Like']");
    }

    const likeButton = await likeSvg.getProperty('parentNode');

    // like the image
    console.log("liking ...");
    likeButton.click();
    await insta.page.waitForTimeout(1000);
    console.log("done liked");

    await insta.likeImageComments(2);
  }

}

module.exports = insta;