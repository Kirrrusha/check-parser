const axios = require('axios');
const fs = require('fs');

function readFileAsync(filePath, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, encoding, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function getRandomLine(lines) {
  const randomIndex = Math.floor(Math.random() * lines.length);
  return lines[randomIndex];
}

function getRandomUserAgent() {
  return readFileAsync('useragent.txt', 'utf8')
    .then((data) => {
      const lines = data.split('\n');
      const randomLine = getRandomLine(lines);
      return randomLine;
    })
    .catch((error) => {
      console.error('Ошибка при чтении файла:', error);
      throw error;
    });
}

async function makeRequest(url) {
  const useragent = await getRandomUserAgent();
  return new Promise((resolve, reject) => {
    axios.get(url, { 'User-Agent': useragent })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

module.exports = {
  makeRequest
}