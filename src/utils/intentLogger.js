module.exports = function intentLogger(event) {
  const { name, slots } = event.request.intent;
  const slotValues = slots && Object.values(slots);
  if(slotValues && slotValues.length) {
    const slotText = slotValues.map(({name, value}) => `${name}: ${value}`).join(', ');
    console.log(`INTENT ${name} ( ${slotText} )`);
  } else {
    console.log(`INTENT ${name}`);
  }
}
