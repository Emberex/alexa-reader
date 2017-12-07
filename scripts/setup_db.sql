-- Run this in psql

CREATE DATABASE bookreader;
\c bookreader;

-- Tables

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title text NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  alexa_user_id VARCHAR(256) NOT NULL,
  name text DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE text_chunks (
  id SERIAL PRIMARY KEY,
  index integer NOT NULL,
  content text NOT NULL,
  book_id integer REFERENCES books (id) NOT NULL,
  is_last boolean DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reading_sessions (
  id SERIAL PRIMARY KEY,
  book_id integer REFERENCES books (id) NOT NULL,
  text_chunk_id integer REFERENCES text_chunks (id) NOT NULL,
  user_id integer REFERENCES users (id) NOT NULL,
  updated_at TIMESTAMP default NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
