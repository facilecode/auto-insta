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
    const tags = ['gyumritheatre', 'javascript', 'python'];
    
    //await insta.goToHashtagPage(tags[0]);
    // like images
    //await insta.likeImages(5);
    
    for (let i=0; i<tags.length; i++) {
        console.log('tag ', tags[i]);

        await insta.goToHashtagPage(tags[i]);
        // like images
        await insta.likeImages(5);
    }
    
    

})();
