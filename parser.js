require('dotenv').config();
const cheerio = require('cheerio');
const axios = require('axios');
const { sendTelegramMessage } = require('./telegram.js')

  const telegramAdminId = process.env.TELEGRAM_ADMIN_ID;
  const telegramIds = (process.env.TELEGRAM_ID_LIST || '').split(',').concat(telegramAdminId);

 async function ParserTickets() {
  const sitesUrl = (process.env.SITES_URL || '').split(',');

  const titleSelector = 'h1';
  const sectorListSelector = 'section.sector-list';
  const emptySelector = 'div.empty-sectors'
  const sectorSelector = 'a.sector-item';
  const dateSelector = '.date';

  try {
    for (const url of sitesUrl) {
      try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const parentElement = $(sectorListSelector);
        const emptyElement = $(emptySelector);
        const titleText =  $(titleSelector).text();
        const dateText = $(dateSelector).text();

        if(!!emptyElement) {
          console.log(`${new Date().toISOString()} Нет билетов на ${String(dateText.trim())}`);
          telegramIds.forEach(telegramId => {
            sendTelegramMessage(telegramId, `${titleText}: нет билетов на ${String(dateText.trim())}`)
          })
          continue;
        }

        if (parentElement) {
          const sectors = $(`${sectorListSelector} ${sectorSelector}`);

          for (const sector of sectors) {
            const text = await sector.text();
            console.log(`${new Date().toISOString()} Текст sector: ${text}` );
            telegramIds.forEach(telegramId => {
              sendTelegramMessage(telegramId, `${titleText}: билет ${text}`)
            })
          }
        } else {
          console.error('Родительский элемент не найден');
        }
      } catch (error) {
        console.error('Ошибка при загрузке HTML:', error);
      }



        // const parentElement = $(sectorListSelector);


        // const pageTitle = $('title').text();
        // console.log(`Заголовок страницы: ${pageTitle}`);

      // const browser = await puppeteer.launch({ headless: 'new' });

      // const page = await browser.newPage();

      // await page.goto(url);
      // const parentElement = await page.$(sectorListSelector);
      // const emptyElement = await page.$(emptySelector);
      // const dateElement = await page.$(dateSelector);
      // const titleElement = await page.$(titleSelector);
      // const titleText = await page.evaluate(el => el.textContent, titleElement).then((text) => text.trim()).catch(error => console.error('textContent', String(error)));
      // const dateText = await page.evaluate(el => el.textContent, dateElement).then((text) => text.trim()).catch(error => console.error('dateText', String(error)));

      // if(!!emptyElement) {
      //   await browser.close();
      //   console.log(`${new Date().toISOString()} Нет билетов на ${String(dateText.trim())}`);
      //   telegramIds.forEach(telegramId => {
      //     sendTelegramMessage(telegramId, `${titleText}: нет билетов на ${String(dateText.trim())}`)
      //   })
      //   continue;
      // }

      // if (parentElement) {
      //   const sectors = await parentElement.$$(sectorSelector);

      //   for (const sector of sectors) {
      //     const text = await sector.evaluate(node => node.textContent);
      //     console.log(`${new Date().toISOString()} Текст sector: ${text}` );
      //     telegramIds.forEach(telegramId => {
      //       sendTelegramMessage(telegramId, `${titleText}: билет ${text}`)
      //     })
      //   }
      // } else {
      //   console.log('Родительский элемент не найден');
      // }

      // await browser.close();
    }
  } catch (error) {
    console.error(`${new Date().toISOString()} Произошла ошибка ${String(error)}`);
    sendTelegramMessage(telegramAdminId, `Произошла ошибка ${String(error)}`)
  }
};

module.exports = {
  ParserTickets
}
