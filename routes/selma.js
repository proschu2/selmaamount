var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');

const {
  Pool
} = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

const selma = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()

  const navigationPromise = page.waitForNavigation()

  await page.goto('https://www.selma.io/')

  await page.setViewport({
    width: 1707,
    height: 822
  })

  await page.waitForSelector('.simple-top > .page-container > .content-container > .front-container > .front-content')
  await page.click('.simple-top > .page-container > .content-container > .front-container > .front-content')

  await page.waitForSelector('#top-bar > .top-bar-right > .dropdown > li:nth-child(7) > .text-link')
  await page.click('#top-bar > .top-bar-right > .dropdown > li:nth-child(7) > .text-link')

  await navigationPromise

  await page.waitForSelector('section #user_email')
  await page.click('section #user_email')
  await page.type('section #user_email', process.env.EMAIL)

  await page.waitForSelector('section #user_password')
  await page.click('section #user_password')
  await page.type('section #user_password', process.env.PASSWORD)

  await page.waitForSelector('section > .row > #new_user > .actions > .button')
  await page.click('section > .row > #new_user > .actions > .button')

  await navigationPromise

  await page.waitForSelector('.my-planet-hero > .my-planet-stats > .my-planet-hero-top-row > .column > .stat-figure')
  await page.click('.my-planet-hero > .my-planet-stats > .my-planet-hero-top-row > .column > .stat-figure')
  let element = await page.$('.my-planet-hero > .my-planet-stats > .my-planet-hero-top-row > .column > .stat-figure');
  var amount = await page.evaluate(element => element.textContent, element);
  amount = amount.replace('CHF', '');
  amount = amount.replace("'", '');
  amount = amount.replace('’','');

  await page.waitForSelector('.my-planet-stats > .my-planet-hero-top-row > .column > .change-figures > .change-figure:nth-child(2)')
  await page.click('.my-planet-stats > .my-planet-hero-top-row > .column > .change-figures > .change-figure:nth-child(2)')
  element = await page.$('.my-planet-stats > .my-planet-hero-top-row > .column > .change-figures > .change-figure:nth-child(2)');
  var change = await page.evaluate(element => element.textContent, element);
  change = change.replace('+', '');
  change = change.replace('CHF', '');


  await page.waitForSelector('.my-planet-stats > .my-planet-hero-top-row > .column > .change-figures > .change-figure:nth-child(4)')
  await page.click('.my-planet-stats > .my-planet-hero-top-row > .column > .change-figures > .change-figure:nth-child(4)')
  element = await page.$('.my-planet-stats > .my-planet-hero-top-row > .column > .change-figures > .change-figure:nth-child(4)');
  var perc = (await page.evaluate(element => element.textContent, element));
  perc = perc.replace('+', '');
  perc = perc.replace('%', '');
  await browser.close()

  return [amount.trim(), perc, change.trim()]
}

router.get('/', async function (req, res, ) {
  const selmaAmount = await selma();
  res.send(`${selmaAmount[0]} | ${selmaAmount[2]} | ${selmaAmount[1]}<iframe style="border: 2px solid #ebebeb; height: 600px; width: 100%;" src="https://vizydrop.com/shared/drop/5e00b0fa80130645a2c5b7cc?authkey=5786f6575f01959f38e2" ></iframe>`);
});

router.get('/add', async function (req, res, next) {
  const selmaAmount = await selma();
  try {
    const client = await pool.connect()
    const result = await client.query(`INSERT INTO SELMA(date,amount,percentage,change) VALUES (now(),${Number(selmaAmount[0])},${Number(selmaAmount[1])}, ${Number(selmaAmount[2])});`);
    const results = {
      'results': (result) ? result.rows : null
    };
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});
module.exports = router;