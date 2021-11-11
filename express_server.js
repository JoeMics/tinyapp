const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const PORT = 8080; // default port 8080

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls', (req, res) => {
  const user = findUserByCookie(users, req.session.userID);

  //check if user is logged in
  if (!user) {
    const templateVars = {
      user,
      message: "You must be logged in.",
      responseCode: 403,
    };
  
    return res.status(403).render('error', templateVars);
  }

  const templateVars = {
    user,
    urls: urlsForUser(urlDatabase, user.id),
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  // check if user is logged in before creating a url
  const user = findUserByCookie(users, req.session.userID);

  //check if user is logged in
  if (!user) {
    const templateVars = {
      user,
      message: "You must be logged in.",
      responseCode: 403,
    };
  
    return res.status(403).render('error', templateVars);
  }

  const { longURL } = req.body;
  // TODO: check if longURL exists already
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL,
    userID: user.id
  };

  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const user = findUserByCookie(users, req.session.userID);
  if (!user) {
    return res.redirect('/login');
  }

  const templateVars = {
    user,
  };

  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  // TODO: check if url exists first
  const user = findUserByCookie(users, req.session.userID);
  // if user is not logged in, return 403
  if (!user) {
    const templateVars = {
      user,
      message: "You must be logged in.",
      responseCode: 403,
    };
  
    return res.status(403).render('error', templateVars);
  }

  // check if link doesn't belong to user, return 403
  const userURLS = urlsForUser(urlDatabase, user.id);
  if (!userURLS[shortURL]) {
    const templateVars = {
      user,
      message: "You do not have permissions to edit this url",
      responseCode: 403,
    };

    return res.status(403).render('error', templateVars);
  }

  const templateVars = {
    user,
    shortURL,
    longURL: urlDatabase[shortURL].longURL
  };

  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  // if shortURL doesn't exist in database, take to homepage for now
  if (!urlDatabase[shortURL]) {
    res.status(404);
    return res.redirect('/');
  }

  res.redirect(`${urlDatabase[shortURL].longURL}`);
});

app.get('/register', (req, res) => {
  const user = findUserByCookie(users, req.session.userID);

  const templateVars = {
    user
  };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const user = findUserByCookie(users, req.session.userID);
  const templateVars = {
    user
  };
  res.render('login', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  const user = findUserByCookie(users, req.session.userID);
  // if user is not logged in, return 403
  if (!user) {
    return res.status(403).send("Error: must be logged in to delete URLs");
  }
  // check if link doesn't belong to user, return 403
  const userURLS = urlsForUser(urlDatabase, user.id);
  if (!userURLS[shortURL]) {
    return res.status(403).send("Error: You do not have permissions to delete this URL");
  }
  
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const user = findUserByCookie(users, req.session.userID);

  // if user is not logged in, return 403
  if (!user) {
    return res.status(403).send("Error: must be logged in to edit short URLs");
  }
  // check if link doesn't belong to user, return 403
  const userURLS = urlsForUser(urlDatabase, user.id);
  if (!userURLS[shortURL]) {
    return res.status(403).send("Error: You do not have access to this URL");
  }

  // update object in the urlDatabase
  const { newURL } = req.body;
  urlDatabase[shortURL].longURL = newURL;

  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(users, email);
  // if user can't be found, respond with 403
  if (!user) {
    return res.status(403).send('User not found');
  }
  // if found compare passwords
  bcrypt.compare(password, user.password, (err, isMatching) => {
    if (!isMatching) {
      // if they don't match, respond with 403
      return res.status(403).send('Password and email do not match');
    }

    req.session.userID = user.id;
    res.redirect('/urls');
  });
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  //check to make sure email and pass are not empty strings
  if (email === '' || password === '') {
    return res.status(400).send('No empty fields allowed');
  }
  // check to make sure email is not in users already
  if (findUserByEmail(users, email)) {
    return res.status(400).send('Account already exists');
  }

  // hash and salt the plaintext password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    const newUser = {
      id: generateRandomString(),
      email,
      password: hashedPassword,
    };
    // update users object with object created here
    users[newUser.id] = newUser;
  
    req.session.userID = newUser.id;
    res.redirect('/urls');
  });
});

app.post('/logout', (req, res) => {
  req.session.userID = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
