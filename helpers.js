const generateRandomString = () => {
  return Math.random().toString(16).substr(2, 6);
};

const findUserByCookie = (userDB, userIdCookie) => {
  return userDB[userIdCookie];
};

const findUserByEmail = (userDB, email) => {
  for (const user in userDB) {
    if (email === userDB[user].email) {
      return userDB[user];
    }
  }
};

const urlsForUser = (urlDB, id) => {
  const userURLS = {};
  for (const url in urlDB) {
    // check to see if the url's userID === id
    if (urlDB[url].userID === id) {
      //  if it is, add it to the new object
      userURLS[url] = urlDB[url];
    }
  }
  return userURLS;
};

module.exports = {
  generateRandomString,
  findUserByCookie,
  findUserByEmail,
  urlsForUser,
};