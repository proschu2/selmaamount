var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  res.send(await (async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    
    const navigationPromise = page.waitForNavigation()
    
    await page.goto('https://www.selma.io/')
    
    await page.setViewport({ width: 1707, height: 822 })
    
    await page.waitForSelector('.simple-top > .page-container > .content-container > .front-container > .front-content')
    await page.click('.simple-top > .page-container > .content-container > .front-container > .front-content')
    
    await page.waitForSelector('#top-bar > .top-bar-right > .dropdown > li:nth-child(7) > .text-link')
    await page.click('#top-bar > .top-bar-right > .dropdown > li:nth-child(7) > .text-link')
    
    await navigationPromise
    
    await page.waitForSelector('section #user_email')
    await page.click('section #user_email')
    await page.type('section #user_email','sanzio@sanziomonti.xyz')
    
    await page.waitForSelector('section #user_password')
    await page.click('section #user_password')
    await page.type('section #user_password','G%K7hCaePk9^9BJAVrj')
  
    await page.waitForSelector('section > .row > #new_user > .actions > .button')
    await page.click('section > .row > #new_user > .actions > .button')
    
    await navigationPromise
    
    await page.waitForSelector('.my-planet-stats > .my-planet-hero-top-row > .column > .change-figures > .change-figure:nth-child(2)')
    await page.click('.my-planet-stats > .my-planet-hero-top-row > .column > .change-figures > .change-figure:nth-child(2)')
    let element = await page.$('.my-planet-stats > .my-planet-hero-top-row > .column > .change-figures > .change-figure:nth-child(2)')
    const amount = (await page.evaluate(element => element.textContent, element))

    await page.waitForSelector('.my-planet-stats > .my-planet-hero-top-row > .column > .change-figures > .change-figure:nth-child(4)')
    await page.click('.my-planet-stats > .my-planet-hero-top-row > .column > .change-figures > .change-figure:nth-child(4)')
    element = await page.$('.my-planet-stats > .my-planet-hero-top-row > .column > .change-figures > .change-figure:nth-child(4)')
    const perc = (await page.evaluate(element => element.textContent, element))
    await browser.close()

    return `${amount} | ${perc}`
  })());
});

module.exports = router;
