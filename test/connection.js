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

    console.log("OK");
})();
