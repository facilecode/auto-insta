require('dotenv').config()

const insta = require('./insta');
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
    await insta.page.waitForTimeout(4000);
    // refuse save account

    // refuse notifications
    await insta.hashtagPage('python');

})();
