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

describe('#findUserByEmail', () => {
  it("should return the user object by it's email", () => {
    const userObj = findUserByEmail(users, 'b@b');
    const expectedUser = {
      id: '5a0fae',
      email: 'b@b',
      password: '$2b$10$BiMgdxbzvtfdO4wIKEP5deqN8Vk0HF0m4FhUnzYK7Z2tJnCVROcJG'
    };

    assert.deepEqual(userObj, expectedUser);
  });

  it('should return undefined if no match', () => {
    const nonExistantUser = findUserByEmail(users, 'not@real.email');
    assert.isUndefined(nonExistantUser);
  });
});

describe('#generateRandomString', () => {
  it('should not generate two identical strings', () => {
    const randStringOne = generateRandomString();
    const randStringTwo = generateRandomString();

    assert.notEqual(randStringOne, randStringTwo);
  });

  it('should return a 6 digit string', () => {
    const randString = generateRandomString();

    assert.isTrue(randString.length === 6);
  });
});

describe('#findUserByCookie', () => {
  it('should return the correct user with the decoded id cookie', () => {
    const decodedCookie = '049b06';
    const expectedUser = {
      id: '049b06',
      email: 'a@a',
      password: '$2b$10$n.xHo8DCl9v/Pnd9.pqrHOMz4bCTeu49EeyOeRvM.rv46YqZEDXDy'
    };
    const actualUser = findUserByCookie(users, decodedCookie);

    assert.deepEqual(expectedUser, actualUser);
  });

  it('should return undefined if not provided a matching id/cookie', () => {
    const notACookie = 'a0a0a0';
    const actualUser = findUserByCookie(users, notACookie);

    assert.isUndefined(actualUser);
  });

  it('should return undefined if not provided any id/cookie', () => {
    const actualUser = findUserByCookie(users);

    assert.isUndefined(actualUser);
  });
});