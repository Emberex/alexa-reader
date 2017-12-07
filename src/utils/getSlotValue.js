module.exports = function getSlotValue(event, key, defaultValue=null) {
  const { slots } = event.request.intent;
  return slots && slots[key] ? slots[key].value : defaultValue;
};
