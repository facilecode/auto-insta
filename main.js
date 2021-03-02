const insta = require('./insta');

(async () => {

    // initialize the page
    await insta.initialize();

    // accept the cookies
    await insta.acceptCookies();

})();