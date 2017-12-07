const fetch = require('node-fetch');
const config = require('./config');

exports.handler = (event, context, callback) => {
  try {
    const url = `${config.server}/api/skill`;
    const method = 'POST';
    const body = JSON.stringify({event, context});
    const headers = new fetch.Headers();

    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    fetch(url, {method, body, headers})
      .then((response) => response.json())
      .then((response) => callback(null, response))
      .catch(callback);
  } catch (err) {
    callback(err);
  }
};
