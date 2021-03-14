const puppeteer = require('puppeteer');
const BASE_URL = 'https://www.instagram.com';

const insta = {
  browser: null,
  page: null,
  //likesPerTag: null,
  //likeCommentsPerTag: null,

  initialize: async (config) => {
    insta.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });
    // init vars from config
    insta.likesPerTag = config.likesPerTag;
    insta.likeCommentsPerTag = config.likeCommentsPerTag;
    insta.likeAgain = config.likeAgain;
  
    insta.page = await insta.browser.newPage();
    await insta.page.setDefaultNavigationTimeout(0);
    await insta.page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    // wait for cookies to appear
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
    closeButton.click();
    console.log("closeButton clicked ...");
    await insta.page.waitForTimeout(2000);
  },

  /*
   * a function to check whether opened image is liked or not
   * return bool
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
     * a function to check whether a comment is liked or not
     * return bool
     */
    isCommentLiked: async() => {
      // to-do
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

  /*
   * This function is called when a publication is previewed
   * we like first n comments
   */
  likeComments: async () => {
    console.log('likeImageComments()');
    const commentSvgs = await insta.page.$$("svg[aria-label='Like']");
    console.log("commentsSVGs length ", commentSvgs.length);

    for (let i=0; i<insta.likeCommentsPerTag; i++) {
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

    const isLiked = await insta.isImageLiked();

    if (isLiked) {
      if (insta.likeAgain) { // configured to like again
        console.log('Unliking to like again');
        likeButton.click();
        await insta.page.waitForTimeout(1000);
        console.log('Unliked ...')
      }
      else
      {
        console.log('Already liked, skipping...');
        await insta.page.waitForTimeout(1000);
        return;
      }
    }
    else{ // not liked
      console.log('Liking ...');
      likeButton.click();
      await insta.page.waitForTimeout(1000);
      console.log('Liked');
    }
  },
  
  accountStuff: async (img) => {
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
  },

  getRandomLinks: async (allTagImages) => {
    if (allTagImages < insta.likesPerTag) {
      console.log('Not enough samples to like, generating simple array');
      uniqueImg = [...Array(allTagImages).keys()];
      return uniqueImg;
    }
    else {
      // get n random images from the links images
      const randomImgIndexes = Array.from({length: insta.likesPerTag*2}, () => Math.floor(Math.random() * allTagImages));
      // remove duplicate indexes with Set()
      uniqueImg = [...new Set(randomImgIndexes)];
      uniqueImg = uniqueImg.slice(0, insta.likesPerTag);
      console.log('random ', randomImgIndexes);
      console.log('unique ', uniqueImg, 'unique.length ', uniqueImg.length);
      return uniqueImg;
    }
  },
  // main function
  main: async() => {
    await insta.page.waitForSelector('img[style="object-fit: cover;"]');
    
    await insta.page.waitForTimeout(2000);
    // scroll down
    await insta.page.mouse.wheel({ deltaY: 1000 });
    await insta.page.waitForTimeout(2000);

    const imageLinks = await insta.page.$$('img[style="object-fit: cover;"]');
    const allTagImages = imageLinks.length;

    // get a list of image links to do some actions
    let uniqueImg = await insta.getRandomLinks(allTagImages);

    /*
     * Now that we have a random set of publications
     * we are going to do some actions
     */
    console.log(uniqueImg.length)
    for (let i = 0; i < uniqueImg.length; i++) {
      console.log("===== img n°: ", i+1);

      // open image preview
      await insta.openImage(imageLinks[i]);

      // like image
      await insta.likeImage();
      
      // like comments
      await insta.likeComments();

      // close the image preview
      await insta.closeImagePreview();
    }

    console.log("___ ending task ____");

    /* Protocol Error is thrown */
    // close the page
    //await insta.page.close();
    // close the browser
    //await insta.browser.close();
    
  },


}

module.exports = insta;