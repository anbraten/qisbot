require('dotenv').config();

const Api = require('./api');
const DB = require('./db');
const Telegram = require('./telegram');
const Log = require('./log');

const BASE_URL = process.env.QIS_URL;
const { TELEGRAM_CHATID, QIS_REFRESH } = process.env;

let token;
let asi;

async function updateGrades() {
  const grades = await Api.fetchGrades(token, asi);

  if (!grades) { return; }

  grades.forEach(async (g) => {
    if (!DB.get('grades').find({ id: g.id }).value()) {
      DB.get('grades').push(g).write();
      await Telegram.send(TELEGRAM_CHATID, `Du hast eine neue Note für *${g.name}* im erhalten. [QIS öffnen](${BASE_URL}/rds?state=user&type=0)`);
      Log('info', 'New grade for:', g.name);
    }
  });
}

async function load() {
  Log('debug', 'Started loading ...');

  if (!token || !Api.isTokenValid(token)) {
    token = await Api.login(process.env.QIS_USER, process.env.QIS_PASSWORD);
    asi = await Api.fetchAsi(token);
    // save token & asi to database
    DB.set('auth', {
      token,
      asi,
    }).write();

    Log('debug', 'new token:', token, 'and asi:', asi);
  }

  await updateGrades();
  Log('debug', 'Finished loading!');
}

async function init() {
  // load token & asi from database
  token = DB.get('auth.token').value();
  asi = DB.get('auth.asi').value();

  Log('info', 'QIS-Bot V1.0 started');
  await load();
  setInterval(load, (QIS_REFRESH || 5) * 60 * 1000); // check every 5 Minutes
}

init();
