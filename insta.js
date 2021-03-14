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

    // wait for the cookies to appear
    await insta.page.waitForTimeout(2000);
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
    await insta.page.waitForTimeout(2000);
  },

  /*
   * a function to check whether opened image is liked or not
   * return [bool, svgElement]
   */
  isImageLiked: async() => {
    console.log("isImageLiked() ...")
    // image's like button svg is always bigger that those of comments
    const svgElement = await insta.page.$eval("svg[height='24']", e => e.outerHTML);
   
    if (svgElement.includes('Unlike')) {
      console.log("isImageLiked(): already liked");
      return true;
    }
    else{
     console.log("isImageLiked(): not liked");
     return false;
    }
  },

  /*
   * checking if an account is private 
   * while visiting the account from comments
   */
  isAccountPrivate: async () => {
    /* 
     * This Account is Private is in a 'h2'
     * We get all 'h2' elements and check text
     */
    console.log('checking if private');
    let elements = await insta.page.$$('h2');
    //console.log('elements ', elements)

    for (let i=0; i<elements.length; i++) {
      let obj = await elements[i].getProperty('innerText');
      console.log('text ', obj._remoteObject.value);

      if (obj._remoteObject.value == "This Account is Private") {
        return true;
      }

      return false;
    }
  },

  likeImagesAndComments: async(nLikes, nComments) => {
    await insta.page.waitForSelector('img[style="object-fit: cover;"]');
    
    //const links = await insta.page.evaluate(() => Array.from(document.querySelectorAll("article > div > div > div > div > a > div > div > img"), e => e));
    // const links = await insta.page.$("article > div > div > div > div > a > div > div > img");
    //const n_links = links.slice(0, n);
    await insta.page.waitForTimeout(1000);
    
    // scroll down
    await insta.page.mouse.wheel({ deltaY: 1000 });
    
    await insta.page.waitForTimeout(2000);

    const imageLinks = await insta.page.$$('img[style="object-fit: cover;"]');

    // make sure that n is not greater than links.length
    // get n random images from the links images
    const randomImgIndeces = Array.from({length: nLikes}, () => Math.floor(Math.random() * nLikes));

    // remove duplicate indexes with Set()
    const uniqueImg = [...new Set(randomImgIndeces)];

    /*
     * Now that we have a random set of publications
     * we are going to do some actions
     */
    if (nLikes < imageLinks.length) {
      // forEach doesn't work
      for (let i = 0; i < uniqueImg.length; i++) {
        console.log("in foor loop");
        console.log("================================");
        console.log("img n°: ", i+1);
        console.log("================================");

        // open image preview
        await insta.openImage(imageLinks[i]);

        // check if the image is already liked or not
        const isLiked = await insta.isImageLiked();
        
        if (!isLiked) {
          await insta.likeImage();
        }
        else{
          console.log('Already liked, skipping');
          await insta.page.waitForTimeout(1000);
        }
        // close the image preview
        await insta.closeImagePreview();

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
  likeComments: async (n) => {
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

  openImage: async (imageLink) => {
    console.log("opening image");
    imageLink.click();
    await insta.page.waitForTimeout(2000);
    console.log("opened");
  },

  likeImage: async () => {
    let likeSvg = await insta.page.$("svg[height='24']");
    let likeButton = await likeSvg.getProperty("parentNode");

    console.log("liking ...");
    likeButton.click();
    await insta.page.waitForTimeout(1000);
    console.log("done liked");
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
      // only like comments of the image if image is liked
      //await insta.likeImageComments(10);
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

    /* replaced above in the loop
    // like comments of the image
    await insta.likeComments(2);
    */
    // get commented accounts
    /*
     * document.querySelectorAll('div > a > img[data-testid="user-avatar"]')
     * returns a list of accounts that commented the publication
     * if the author has added a bio then first 2 elements are author's accounts
     * otherwise, only the first value is the author's account
     */

    const accounts = await insta.page.$$('div > a > img[data-testid="user-avatar"]');
    console.log('accounts ', accounts);

    const accountSVG = await accounts[2].getProperty('parentNode');

    accountSVG.click();

    await insta.page.waitForTimeout(3000); 

    let isPrivate = await insta.isAccountPrivate();
    console.log('isPrivate ', isPrivate);
  }

}

module.exports = insta;