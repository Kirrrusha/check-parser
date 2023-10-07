require('dotenv').config();
const { Telegraf } = require('telegraf');

const botToken = process.env.BOT_TOKEN;

const bot = new Telegraf(botToken);

bot.start((ctx) => {
  ctx.reply('Привет!');
});

// Запускаем бот
bot.launch();

function sendTelegramMessage(chatId, message) {
  bot.telegram.sendMessage(chatId, message)
    .then(() => {
      console.log(`Сообщение успешно отправлено: ${message}`);
    })
    .catch((error) => {
      console.error(`Ошибка при отправке сообщения: ${error}`);
    });
}

module.exports = {
  sendTelegramMessage
}
