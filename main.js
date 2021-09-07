require('dotenv').config()

const fs = require('fs')
const insta = require('./insta');
const username = process.env.INSTA_USERNAME;
const password = process.env.INSTA_PASSWORD;

(async () => {
    // parse config file
    let rawData = fs.readFileSync('config.json');
    let config = JSON.parse(rawData);
    console.log('config ', config);
    
    console.log("init ...")
    // initialize the page
    await insta.initialize(config);
    console.log("init done")

    console.log("accepting cookies")
    // accept the cookies
    await insta.acceptCookies();
    console.log("accepted")

    console.log("logging in")
    // login
    await insta.login(config.login, config.password);
    console.log("logged in")

    // wait a little so elements appeae
    await insta.page.waitForTimeout(4000);

    // refuse save account
    // TO-DO

    // refuse notifications
    // TO-DO

    
    //await insta.goToHashtagPage(tags[0]);
    // like images
    //await insta.likeImages(5);
    
    for (let i=0; i<config.tags.length; i++) {
        console.log('tag ', config.tags[i]);

        await insta.goToHashtagPage(config.tags[i]);
        // like images
        await insta.main();
        // like comments
    }
    
    
})();
