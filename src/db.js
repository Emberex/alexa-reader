const knex = require('knex');
const { first } = require('lodash');
const config = require('../config');

const db = knex({
  client: 'pg',
  connection: {
    database: config.dbName,
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
  }
});
const all = '*';

module.exports = {
  getBooks() {
    return db('books').select(all);
  },

  async createBook(title, chunks) {
     const book = await db('books').returning(all).insert({title}).then(first);
     await Promise.all(chunks.map(
       (content, index) => db('text_chunks').insert({
         index,
         content,
         book_id: book.id,
         is_last: index === (chunks.length - 1),
       })
     ));
     return book;
  },

  findTextChunkAtIndex(bookId, index) {
    return db('text_chunks')
      .where({index, book_id: bookId})
      .first();
  },

  createUser(alexaUserId, name=null) {
    return db('users')
      .returning(all)
      .insert({
        name,
        alexa_user_id: alexaUserId,
      })
      .then(first);
  },

  findUserByAlexaId(alexaUserId) {
    return db('users').where('alexa_user_id', alexaUserId).first();
  },

  async findOrCreateUserByAlexaId(alexaUserId, name='guest') {
    return (
      (await this.findUserByAlexaId(alexaUserId)) ||
      (await this.createUser(alexaUserId, name))
    );
  },

  findUserByName(name) {
    return db('users').where('name', name).first();
  },

  async findOrCreateUserByName(alexaUserId, name) {
    return (
      (await this.findUserByName(name)) ||
      (await this.createUser(alexaUserId, name))
    );
  },

  setUserName(userId, name) {
    return db('users').where('id', '=', userId).update({name});
  },

  findTextChunk(textChunkId) {
    return db('text_chunks').where('id', textChunkId).first();
  },

  findBook(bookId) {
    return db('books').where('id', '=', bookId).first();
  },

  findBookByTitle(title) {
    return db('books').where('title', '=', title.toLowerCase()).first();
  },

  async createReadingSession(userId, bookId) {
    const textChunk = await this.findTextChunkAtIndex(bookId, 0);
    console.log('createReadingSession')
    return db('reading_sessions')
      .returning('*')
      .insert({
        user_id: userId,
        book_id: bookId,
        text_chunk_id: textChunk.id,
      })
      .then(first);
  },

  findReadingSessionByUserAndBook(userId, bookId) {
    return db('reading_sessions')
      .where({
        user_id: userId,
        book_id: bookId,
      })
      .first();
  },

  async findOrCreateReadingSessionByUserAndBook(userId, bookId) {
    return (
      (await this.findReadingSessionByUserAndBook(userId, bookId)) ||
      (await this.createReadingSession(userId, bookId))
    );
  },

  updateReadingSessionTextChunk(readingSessionId, textChunkId) {
    return db('reading_sessions').where('id', readingSessionId).update({text_chunk_id: textChunkId});
  },

  async findRecentReadingSession(userId) {
    return db('reading_sessions')
      .where('user_id', userId)
      .orderBy('updated_at', 'desc')
      .first();
  },
};

// bind everything
Object.entries(module.exports).forEach(([key, fn]) => {
  module.exports[key] = fn.bind(module.exports);
});
