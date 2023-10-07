require('dotenv').config();
const puppeteer = require('puppeteer');
const { sendTelegramMessage } = require('./telegram.js')

  // const telegramIds = ['325271066', '425159769'];
  const telegramAdminId = process.env.TELEGRAM_ADMIN_ID;
  const telegramIds = process.env.TELEGRAM_ID_LIST.split(',').concat(telegramAdminId);
  // const telegramIds = [telegramAdminId];


(async () => {
  // const sitesUrl = ['https://vrn.kassir.ru/frame/event/1724640?key=0ba9d050-ad2c-cd51-ad78-e649c6f94f9a&WIDGET_4008333277=4kuh76ooed9psnofsrh72anfqn', 'https://vrn.kassir.ru/frame/event/1724641?key=0ba9d050-ad2c-cd51-ad78-e649c6f94f9a&WIDGET_4008333277=4kuh76ooed9psnofsrh72anfqn', 'https://vrn.kassir.ru/frame/event/1724642?key=0ba9d050-ad2c-cd51-ad78-e649c6f94f9a&WIDGET_4008333277=4kuh76ooed9psnofsrh72anfqn'];
  // const sitesUrl = ['https://vrn.kassir.ru/frame/action/180639?key=0ba9d050-ad2c-cd51-ad78-e649c6f94f9a&WIDGET_4008333277=4kuh76ooed9psnofsrh72anfqn#1724650'];
  const sitesUrl = process.env.SITES_URL.split(',')

  const titleSelector = 'h1';
  const sectorListSelector = 'section.sector-list';
  const emptySelector = 'div.empty-sectors'
  const sectorSelector = 'a.sector-item';
  const dateSelector = '.date';

  try {
    for (const url of sitesUrl) {
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();

      await page.goto(url);
      const parentElement = await page.$(sectorListSelector);
      const emptyElement = await page.$(emptySelector);
      const dateElement = await page.$(dateSelector);
      const titleElement = await page.$(titleSelector);
      const titleText = await page.evaluate(el => el.textContent, titleElement).then((text) => text.trim()).catch(error => console.error('textContent', String(error)));
      const dateText = await page.evaluate(el => el.textContent, dateElement).then((text) => text.trim()).catch(error => console.error('dateText', String(error)));

      if(!!emptyElement) {
        await browser.close();
        console.log(`${new Date().toISOString()} Нет билетов на ${String(dateText.trim())}`);
        // telegramIds.forEach(telegramId => {
        //   sendTelegramMessage(telegramId, `${titleText}: нет билетов на ${String(dateText.trim())}`)
        // })
        continue;
      }

      if (parentElement) {
        const sectors = await parentElement.$$(sectorSelector);

        for (const sector of sectors) {
          const text = await sector.evaluate(node => node.textContent);
          console.log(`${new Date().toISOString()} Текст sector: ${text}` );
          telegramIds.forEach(telegramId => {
            sendTelegramMessage(telegramId, `${titleText}: билет ${text}`)
          })
        }
      } else {
        console.log('Родительский элемент не найден');
      }

      await browser.close();
    }
  } catch (error) {
    console.error(`${new Date().toISOString()} Произошла ошибка ${String(error)}`);
    sendTelegramMessage(telegramAdminId, `Произошла ошибка ${String(error)}`)
  }
})();
