require('dotenv').config()

const insta = require('../insta')
const username = process.env.INSTA_USERNAME;
const password = process.env.INSTA_PASSWORD;

(async () => {
    
    // initialize the page
    await insta.initialize();

    // accept the cookies
    await insta.acceptCookies();

    // login
    await insta.login(username, password);

    // wait a little so elements appeae
    await insta.page.waitForTimeout(3000);

    // go to a not liked image
    const notLikedPublication = "https://www.instagram.com/p/CLFRo76gCv8/";
    await insta.page.goto(notLikedPublication, { waitUntil: 'networkidle2' });
    await insta.page.waitForTimeout(3000);

    let isLiked = await insta.isImageLiked();
    console.log('Not liked is ', isLiked);

    // go to a liked image
    const likedPublication = "https://www.instagram.com/p/CLFRI0NggVH/";
    await insta.page.goto(likedPublication, { waitUntil: 'networkidle2' });
    
    await insta.page.waitForTimeout(3000);
    isLiked = await insta.isImageLiked();
    console.log('Liked is ', isLiked);
    
})();
