require('dotenv').config()

const fs = require('fs')
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
    // TO-DO

    // refuse notifications
    // TO-DO

    // read hashtags from file
    let rawData = fs.readFileSync('config.json');
    let config = JSON.parse(rawData);
    console.log('config ', config);
    
    //await insta.goToHashtagPage(tags[0]);
    // like images
    //await insta.likeImages(5);
    
    for (let i=0; i<config.tags.length; i++) {
        console.log('tag ', config.tags[i]);

        await insta.goToHashtagPage(config.tags[i]);
        // like images
        await insta.likeImages(config.likes);
    }
    
    
})();
