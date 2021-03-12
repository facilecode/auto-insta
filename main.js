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
    let tags = fs.readFileSync('hashtags.txt').toString().split('\n');
    tags = tags.map(tag => tag.replace(/(\r\n|\n|\r)/gm, ""));
    console.log('hashtags ', tags);
    
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
