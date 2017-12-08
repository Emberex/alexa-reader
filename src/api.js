const express = require('express');
const skill = require('./skill');
const router = module.exports = express.Router();

router.post('/skill', async (req, res) => {
  const { event, context } = req.body;
  const response = await skill(event, context);
  response.sessionAttributes = Object.assign({}, event.session.attributes, response.sessionAttributes);
  res.json(response);
});
