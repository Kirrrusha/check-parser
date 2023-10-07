const { ParserTickets } = require('./parser')

async function start() {
  await ParserTickets();
}

// Вызовите функцию при запуске скрипта
start();
