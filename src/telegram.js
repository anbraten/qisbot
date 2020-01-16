const { Telegram } = require('telegraf');

const tgBot = new Telegram(process.env.TELEGRAM_TOKEN);

async function send(chatId, text) {
  tgBot.sendMessage(chatId, text);
}

module.exports = {
  send,
};
