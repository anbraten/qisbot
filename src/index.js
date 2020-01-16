const axios = require('axios');
const querystring = require('querystring');
const cheerio = require('cheerio');
require('dotenv').config();

const BASE_URL = process.env.QIS_URL;

async function restCall(_options) {
  const options = {
    method: 'get',
    maxRedirects: 0,
    ..._options,
  };
  let res = null;

  try {
    res = await axios(options);
  } catch (error) {
    console.error(error.message);
    console.log(error.response.data || null);
  }

  return res;
}

async function login(username, password) {
  const data = {
    username,
    password,
    submit: 'Ok',
  };

  const options = {
    method: 'post',
    url: `${BASE_URL}/rds?state=user&type=1&category=auth.login`,
    data: querystring.stringify(data),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    validateStatus: (status) => (status >= 200 && status <= 302),
    maxRedirects: 0,
  };

  const res = await restCall(options);

  if (res) {
    return res.headers['set-cookie'].join(' ').match(/JSESSIONID=(.*?);/i)[1];
  }

  return null;
}

async function navigate(token, startUrl, linkText) {
  const options = {
    url: startUrl,
    headers: {
      Cookie: `SESSIONID=${token};`,
    },
    validateStatus: (status) => (status >= 200 && status <= 302),
    maxRedirects: 0,
  };

  const res = await restCall(options);

  if (res) {
    const $ = cheerio.load(res.data);
    console.log($('a'));
    return null;
    /*
    $('a').filter((i) => {
      console.log(i);
      return $(i).text() === linkText;
    });
    */
  }

  return null;
}

async function fetchMarks(token) {
  const data = {
    state: 'notenspiegelStudent',
    next: 'list.vm',
    nextdir: 'qispos/notenspiegel/student',
    createInfos: 'Y',
    struct: 'auswahlBaum',
    nodeID: 'auswahlBaum|abschluss:abschl=84',
    expand: '0',
    asi: 'P5rn7wV2yZ41ihxi8kzV',
  };

  const options = {
    url: `${BASE_URL}//rds?${querystring.stringify(data)}`,
    headers: {
      Cookie: `SESSIONID=${token};`,
    },
    validateStatus: (status) => (status >= 200 && status <= 302),
    maxRedirects: 0,
  };

  const res = await restCall(options);

  if (res) {
    return res.data;
  }

  return null;
}


async function load() {
  const token = await login(process.env.QIS_USER, process.env.QIS_PASSWORD);
  const ais = await navigate(token, `${BASE_URL}/rds?state=user&type=0`, 'Prüfungsverwaltung');
  // const res = await fetchMarks(token, ais);
  console.log(ais);
}

load();
// setInterval(load, 1000);
