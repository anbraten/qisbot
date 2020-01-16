const axios = require('axios');
const querystring = require('querystring');
const cheerio = require('cheerio');

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

// go to home and grep new asi id
async function fetchAsi(token) {
  const data = {
    state: 'change',
    type: '1',
    moduleParameter: 'studyPOSMenu',
    nextdir: 'change',
    next: 'menu.vm',
    subdir: 'applications',
    xml: 'menu',
    purge: 'y',
    navigationPosition: 'functions,studyPOSMenu',
    breadcrumb: 'studyPOSMenu',
    topitem: 'functions',
    subitem: 'studyPOSMenu',
  };

  const options = {
    url: `${BASE_URL}//rds?${querystring.stringify(data)}`,
    headers: {
      Cookie: `JSESSIONID=${token};`,
    },
    validateStatus: (status) => (status >= 200 && status <= 302),
    maxRedirects: 0,
  };

  const res = await restCall(options);

  if (res) {
    return res.data.match(/asi=(.*?)"/i)[1] || null;
  }

  return null;
}

// check if login is still valid
async function isTokenValid(token) {
  const options = {
    url: `${BASE_URL}/rds?state=user&type=0`,
    headers: {
      Cookie: `JSESSIONID=${token};`,
    },
    validateStatus: (status) => (status >= 200 && status <= 302),
    maxRedirects: 0,
  };

  const res = await restCall(options);

  if (res) {
    // check if we got a login form back
    return res.data.indexOf('name="loginform"') !== -1;
  }

  return null;
}

function getModuleGrade(cols) {
  return {
    id: cols.eq(0).text().trim() || null,
    name: cols.eq(1).text().trim() || null,
    attempt: cols.eq(2).text().trim() || null,
    // nullify
    semester: cols.eq(4).text().trim() || null,
    date: cols.eq(5).text().trim() || null,
    grade: cols.eq(6).text().trim() || null,
    points: cols.eq(7).text().trim() || null,
    ects: cols.eq(8).text().trim() || null,
    status: cols.eq(9).text().trim() || null,
  };
}

function getExamGrade(cols) {
  return {
    id: cols.eq(0).text().trim() || null,
    name: cols.eq(1).text().trim() || null,
    // sepcial
    // PO
    attempt: cols.eq(4).text().trim() || null,
    // nullify
    semester: cols.eq(6).text().trim() || null,
    date: cols.eq(7).text().trim() || null,
    // grade
    points: cols.eq(9).text().trim() || null,
    status: cols.eq(11).text().trim() || null,
  };
}

async function fetchGrades(token, asi) {
  const data = {
    state: 'notenspiegelStudent',
    next: 'list.vm',
    nextdir: 'qispos/notenspiegel/student',
    createInfos: 'Y',
    struct: 'auswahlBaum',
    nodeID: 'auswahlBaum|abschluss:abschl=84',
    expand: '0',
    asi,
  };

  const options = {
    url: `${BASE_URL}//rds?${querystring.stringify(data)}`,
    headers: {
      Cookie: `JSESSIONID=${token};`,
    },
    validateStatus: (status) => (status >= 200 && status <= 302),
    maxRedirects: 0,
  };

  const res = await restCall(options);

  if (res) {
    const grades = [];
    const $ = cheerio.load(res.data);
    $('form > table:not([summary])').find('tr').each((i, row) => {
      let cols;

      // exam grade
      cols = $(row).find('td[class^="tabelle1_"]');
      if (cols.length !== 0) {
        grades.push(getExamGrade(cols));
        return;
      }

      // module grade
      cols = $(row).find('td[class="qis_konto"]');
      if (cols.length !== 0) {
        grades.push(getModuleGrade(cols));
      }
    });
    return grades;
  }

  return null;
}


module.exports = {
  isTokenValid,
  login,
  fetchAsi,
  fetchGrades,
};
