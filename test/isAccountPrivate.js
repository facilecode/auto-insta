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

    // go to a private account set for this purpose
    await insta.page.goto("https://www.instagram.com/amelia_beauyeux/", { waitUntil: 'networkidle2' });

    await insta.page.waitForTimeout(3000);

    let isPrivate = await insta.isAccountPrivate();
    console.log('isPrivate ', isPrivate);

    // go to a public account set for this purpose
    await insta.page.goto("https://www.instagram.com/emmanuelmacron/", { waitUntil: 'networkidle2' });

    await insta.page.waitForTimeout(3000);

    isPrivate = await insta.isAccountPrivate();
    console.log('isPrivate ', isPrivate);

    console.log.log("OK");
})();
