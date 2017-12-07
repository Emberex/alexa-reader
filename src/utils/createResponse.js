module.exports = function createResponse(
  sessionAttributes,
  {title='', speech='', repromptText=null, shouldEndSession=false}={}
) {
  return {
    sessionAttributes,
    version: '1.0',
    response: {
      shouldEndSession,
      outputSpeech: {
        type: 'PlainText',
        text: speech,
      },
      card: {
        type: 'Simple',
        title: `SessionSpeechlet - ${title}`,
        content: `SessionSpeechlet - ${speech}`,
      },
      reprompt: {
        outputSpeech: {
          type: 'PlainText',
          text: repromptText,
        },
      },
    },
  };
}
