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

        if(emptyElement.length) {
          console.log(`${new Date().toISOString()} Нет билетов на ${String(dateText.trim())}`);
          sendTelegramMessage(telegramAdminId, `${titleText}: нет билетов на ${String(dateText.trim())}`)
          continue;
        }

        if (parentElement.length) {
          const sectors = $(`${sectorListSelector} ${sectorSelector}`);

          sectors.each((_, element) => {
            const text =  $(element).find('span').text();
            console.log(`${new Date().toISOString()} ${titleText}: билет ${text}` );
            telegramIds.forEach(telegramId => {
              sendTelegramMessage(telegramId, `${titleText}: билет ${text}`)
            })
          })
        } else {
          console.error('Родительский элемент не найден');
        }
      } catch (error) {
        console.error('Ошибка при загрузке HTML:', String(error));
        sendTelegramMessage(telegramAdminId, `Ошибка при загрузке HTML: ${String(error)}`)
      }
    }
  } catch (error) {
    console.error(`${new Date().toISOString()} Произошла ошибка ${String(error)}`);
    sendTelegramMessage(telegramAdminId, `Произошла ошибка ${String(error)}`)
  }
};

module.exports = {
  ParserTickets
}
