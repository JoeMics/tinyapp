const { assert } = require('chai');
const {
  generateRandomString,
  findUserByCookie,
  findUserByEmail,
  urlsForUser,
} = require('../helpers');

// Testing Databases
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "049b06"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "5a0fae"
  }
};

const users = {
  '5a0fae': {
    id: '5a0fae',
    email: 'b@b',
    password: '$2b$10$BiMgdxbzvtfdO4wIKEP5deqN8Vk0HF0m4FhUnzYK7Z2tJnCVROcJG'
  },
  '049b06': {
    id: '049b06',
    email: 'a@a',
    password: '$2b$10$n.xHo8DCl9v/Pnd9.pqrHOMz4bCTeu49EeyOeRvM.rv46YqZEDXDy'
  }
};