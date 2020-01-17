const { Telegram } = require('telegraf');

const token = process.env.TELEGRAM_TOKEN;

const tgBot = token ? new Telegram(token) : null;

async function send(chatId, text, _options) {
  if (!tgBot) { return; }

  tgBot.sendMessage(chatId, text, {
    parse_mode: 'markdown',
    ..._options,
  });
}

module.exports = {
  send,
};
