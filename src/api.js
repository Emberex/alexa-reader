const express = require('express');
const skill = require('./skill');
const router = module.exports = express.Router();

router.post('/skill', async (req, res) => {
  const { event, context } = req.body;
  res.json(await skill(event, context));
});
