const pup = require('puppeteer')

pup.launch({
    headless: false
})
.then(async browser => {

    let url = 'https://www.instagram.com'

    // opening page
    let page = await browser.newPage()
    await page.goto(url, {waitUntil: 'networkidle2' })

    // accepting cookies
    const [button] = await page.$x("//button[text()='Accept']")
    console.log('button -> ', button)
    await button.click()

    // Log In

    // Go to hashtag page from file.txt
    

})
.catch(err => console.log('err - ', err))