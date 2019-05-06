const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')

let browser, page

let user_data = JSON.parse(fs.readFileSync(path.join(__dirname, 'user_data.json')))

async function run() {
    browser = await puppeteer.launch({
        headless: false,
        args: ['--disable-notifications']
    })
    page = await browser.newPage()
    await page.setViewport({
        width: 1200,
        height: 800,
    })
    await page.goto('https://facebook.com')
    login()
}

async function login() {
    await page.type('#email', user_data.email, { delay: 30 })
    await page.type('#pass', user_data.password, { delay: 30 })
    let loginButton = await page.$('#loginbutton input')
    await loginButton.click()
    await page.waitForNavigation()
    await page.goto('https://www.facebook.com/Pierre.dumaydmy/friends')
    await page.waitFor(3000)
    let friends = await getFriends()
    console.log(friends)
    await browser.close()

    //GET ALL FRIENDS LIST
    fs.writeFile("./all_friends.json", JSON.stringify(friends, null, 4), (err) => {
        if (err) {
            console.error(err);
            return;
        };
        console.log("File has been created");
    });
}

async function getFriends() {
    let allFriends = []
    for (let i = 0; i < 10; i++) {
        await page.screenshot({ path: 'facebook_' + (3 + i) + '.png' })
        let friends = await page.$$eval('div.fsl.fwb.fcb>a', friends => friends.map((a) => {
            return {
                name: a.innerText,
                href: a.href
            }
        }))
        friends.forEach((friend) => {
            if (allFriends.indexOf(friend) === -1) {
                allFriends.push(friend)
            }
        })
        await page.evaluate(_ => {
            window.scrollBy(0, window.innerHeight)
        })
        await page.waitFor(1000)
    }
    return new Promise(resolve => {
        resolve(allFriends)
    })
}

run()

