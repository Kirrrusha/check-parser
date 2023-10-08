require('dotenv').config();
const cheerio = require('cheerio');
const https = require('https');
const { sendTelegramMessage } = require('./telegram.js')

const telegramAdminId = process.env.TELEGRAM_ADMIN_ID;
const telegramIds = (process.env.TELEGRAM_ID_LIST || '').split(',').concat(telegramAdminId);

async function ParserTickets() {
  const hostname = process.env.HOST;
  const sitesUrl = (process.env.SITES_URL || '').split(',');

  const titleSelector = 'h1';
  const sectorListSelector = 'section.sector-list';
  const emptySelector = 'div.empty-sectors'
  const sectorSelector = 'a.sector-item';
  const dateSelector = '.date';

  try {
    for (const url of sitesUrl) {
      try {

        const options = {
          hostname,
          port: 443,
          path: url,
          method: 'GET',
        };

        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', async () => {
            // const $ = cheerio.load(data);
            await Check(data)
          });
        });

        req.on('error', (error) => {
          console.error('Ошибка:', error);
        });

        req.end();

        // const response = await axios.get(url, {timeout: 5000});
        // const html = response.data;
        async function Check(response) {
          const $ = cheerio.load(response);

        const parentElement = $(sectorListSelector);
        const emptyElement = $(emptySelector);
        const titleText =  $(titleSelector).text();
        const dateText = $(dateSelector).text();

        if(!!emptyElement.length) {
          console.log(`${new Date().toISOString()} Нет билетов на ${String(dateText.trim())}`);
          sendTelegramMessage(telegramAdminId, `${titleText}: нет билетов на ${String(dateText.trim())}`)
          return;
        }

        if (!!parentElement.length) {
          const sectors = $(`${sectorSelector}`);
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
      }

      } catch (error) {
        console.error('Ошибка при загрузке HTML:', error);
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
