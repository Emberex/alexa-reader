function success(res, body) {
  return res.json({
    body,
    success: true,
  });
}

function fail(res, error) {
  return res.json({
    error,
    success: false
  });
}

function successHandler(res) {
  return (body) => success(res, body);
}

function failHandler(res, prefix) {
  return (error) => fail(res, prefix ? `${prefix}: ${error.message}` : error.message);
}

module.exports = { success, fail, successHandler, failHandler };
