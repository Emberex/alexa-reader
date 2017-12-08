const db = require('./db');
const intentLogger = require('./utils/intentLogger');
const createResponse = require('./utils/createResponse');
const createErrorResponse = require('./utils/createErrorResponse');
const getSlotValue = require('./utils/getSlotValue');
const intentAlias = require('./utils/intentAlias');

async function readNextSentenceResponse(readingSession) {
  const currentTextChunk = await db.findTextChunk(readingSession.text_chunk_id);
  const nextTextChunk= await db.findTextChunkAtIndex(currentTextChunk.book_id, currentTextChunk.is_last ? 0 : currentTextChunk.index + 1);

  await db.updateReadingSessionTextChunk(readingSession.id, nextTextChunk.id);

  return createResponse({readingSession, currentTextChunk, nextTextChunk}, {
    title: 'Reading',
    speech: currentTextChunk.content,
  });
}

const intentHandlers = {
  async 'ReadIntent'(event, context, user) {
    const title = getSlotValue(event, 'booktitle');

    if(title && title.length) {
      const book = await db.findBookByTitle(title.toLowerCase());

      if(!book) {
        return createResponse({}, {
          title: 'Book not found',
          speech: `I couldn't find any books named ${title}`,
        });
      }

      const readingSession = await db.findOrCreateReadingSessionByUserAndBook(user.id, book.id);

      return readNextSentenceResponse(readingSession);
    } else {
      const readingSession = await db.findRecentReadingSession(user.id);

      if(readingSession) {
        return readNextSentenceResponse(readingSession);
      } else {
        return createResponse({}, {
          title: 'What book?',
          speech: `You're not reading anything at the moment. You need to tell me what you want to read.`,
        });
      }
    }
  },

  async 'GetNameIntent'(event, context, user) {
    const text = `You are ${user.name}`;
    return createResponse({}, {
      title: text,
      speech: text,
    });
  },

  async 'ChangeUserIntent'(event, context, user) {
    const alexaUserId = event.session.user.userId;
    const name = getSlotValue(event, 'name');
    if(!name) {
      return createResponse({}, {
        title: 'You must provide a name',
        speech: 'You must provide a name',
      });
    }
    const newUser = await db.findOrCreateUserByName(alexaUserId, name.toLowerCase());

    return createResponse({user: newUser}, {
      title: 'User changed',
      speech: `User changed to ${newUser.name}`,
    });
  },

  async 'AMAZON.StopIntent'(event, context, user) {
    const { attributes={} } = event.session;
    const { readingSession, currentTextChunk } = attributes;

    if(readingSession && currentTextChunk) {
      await db.updateReadingSessionTextChunk(readingSession.id, currentTextChunk.id);
    }

    return createResponse({}, {
      title: 'Stopped reading',
      speech: null,
      shouldEndSession: true,
    });
  },

  async 'AMAZON.RepeatIntent'(event, context, user) {
    const { attributes } = event.session;
    const { readingSession, currentTextChunk } = attributes;

    if(readingSession && currentTextChunk) {
      await db.updateReadingSessionTextChunk(readingSession.id, currentTextChunk.id);
      readingSession.text_chunk_id = currentTextChunk.id;
      return readNextSentenceResponse(readingSession);
    }

    return createResponse({}, {
      title: `Can't repeat`,
      speech: `There's nothing to repeat`,
    });
  },

  async 'AMAZON.PreviousIntent'(event, context, user) {
    const { attributes } = event.session;
    const { readingSession, currentTextChunk } = attributes;

    if(readingSession) {
      if(currentTextChunk && currentTextChunk.index > 0) {
        const previousTextChunk = await db.findTextChunkAtIndex(currentTextChunk.book_id, currentTextChunk.index - 1);
        await db.updateReadingSessionTextChunk(readingSession.id, previousTextChunk.id);
        readingSession.text_chunk_id = previousTextChunk.id;

        return readNextSentenceResponse(readingSession);
      } else {
        return createResponse({}, {
          title: `Can't go back`,
          speech: `There are no previous sections`,
        });
      }
    }

    return createResponse({}, {
      title: `Can't go back`,
      speech: `You're not reading anything at the moment`,
    });
  },
};

intentAlias(intentHandlers, 'ReadIntent', ['AMAZON.NextIntent', 'AMAZON.ResumeIntent']);
intentAlias(intentHandlers, 'AMAZON.StopIntent', ['AMAZON.CancelIntent', 'AMAZON.PauseIntent']);

function runIntent(intentName, event, context, user) {
  const { request } = event;
  const intentHandler = intentHandlers[intentName];
  if(intentHandler) {
    return intentHandler(event, context, user);
  } else {
    throw new Error(`Unknown intent type: ${request.intent.name}`);
  }
}

const requestHandlers = {
  'IntentRequest'(event, context, user) {
    intentLogger(event);
    return runIntent(event.request.intent.name, event, context, user);
  },

  'LaunchRequest'(event, context, user) {
    return createResponse({}, {
      title: 'Welcome to book reader. Ask me to read a book.'
    });
  },
};

module.exports = async (event, context) => {
  try {
    const alexaUserId = event.session.user.userId;
    const { attributes } = event.session;
    let user = attributes && attributes.user;

    if(!user) {
      user = await db.findOrCreateUserByAlexaId(alexaUserId, 'guest');
    }

    const requestHandler = requestHandlers[event.request.type];

    if(requestHandler) {
      return requestHandler(event, context, user);
    } else {
      throw new Error(`Unknown request type: ${event.request.type}`)
    }
  } catch(error) {
    return createErrorResponse(error);
  }
};
