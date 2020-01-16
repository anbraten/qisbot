const { Telegram } = require('telegraf');

const token = process.env.TELEGRAM_TOKEN;

if (token) {
  const tgBot = new Telegram();
}

async function send(chatId, text, _options) {
  if (!token) { return; }

  tgBot.sendMessage(chatId, text, {
    parse_mode: 'markdown',
    ..._options,
  });
}

module.exports = {
  send,
};
