const pup = require('puppeteer')

pup.launch({
    headless: false
})
.then(async browser => {
    let url = 'https://www.instagram.com'

    let page = await browser.newPage()
    await page.goto(url, {waitUntil: 'networkidle2' })

    const [button] = await page.$x("//button[text()='Accept']")
    console.log('button -> ', button)
    await button.click()

})
.catch(err => console.log('err - ', err))