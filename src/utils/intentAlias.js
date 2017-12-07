module.exports = function intentAlias(intentHandlers, intentName, aliases) {
  if(typeof aliases === 'string') aliases = [aliases];

  for(let alias of aliases) {
    intentHandlers[alias] = intentHandlers[intentName];
  }
}
