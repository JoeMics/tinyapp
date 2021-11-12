const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {
  generateRandomString,
  findUserByCookie,
  findUserByEmail,
  urlsForUser,
} = require('./helpers');
const urlDatabase = require('./databases/urlDatabase');
const users = require('./databases/users');

const PORT = 8080; // default port 8080

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");



app.get("/", (req, res) => {
  const user = findUserByCookie(users, req.session.userID);
  if (!user) {
    return res.redirect('/login');
  }

  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const user = findUserByCookie(users, req.session.userID);
  if (!user) {
    return res.status(403)
      .send('You must be logged in to view this page. Log in <a href="/login">here</a>');
  }

  const urls = urlsForUser(urlDatabase, user.id);
  const templateVars = {
    user,
    urls,
  };

  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const user = findUserByCookie(users, req.session.userID);
  if (!user) {
    return res.status(403)
      .send('You must be logged in to view this page. Log in <a href="/login">here</a>');
  }

  const { longURL } = req.body;
  const shortURL = generateRandomString();
  const userID = user.id;
  urlDatabase[shortURL] = {
    longURL,
    userID,
  };

  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  const user = findUserByCookie(users, req.session.userID);
  if (!user) {
    return res.redirect('/login');
  }

  res.render("urls_new", { user });
});

app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  // Check if url exists at all
  if (!urlDatabase[shortURL]) {
    return res.status(404)
      .send('Url does not exist.');
  }

  const user = findUserByCookie(users, req.session.userID);
  if (!user) {
    return res.status(403)
      .send('You must be logged in. Log in <a href="/login">here</a>.');
  }

  // The existence of the short URL must be checked before trying to assign to a variable
  const userURLS = urlsForUser(urlDatabase, user.id);
  if (!userURLS[shortURL]) {
    return res.status(403)
      .send('You do not have permissions to edit this url.');
  }

  const { longURL } = userURLS[shortURL];
  const templateVars = {
    user,
    shortURL,
    longURL,
  };

  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const urlInDatabase = urlDatabase[shortURL];
  if (!urlInDatabase) {
    return res.status(404)
      .send('Url does not exist');
  }

  const { longURL } = urlInDatabase;
  res.redirect(`${longURL}`);
});

app.get('/register', (req, res) => {
  const user = findUserByCookie(users, req.session.userID);
  if (user) {
    res.redirect('/urls');
  }
  
  res.render('register', { user });
});

app.get('/login', (req, res) => {
  const user = findUserByCookie(users, req.session.userID);
  if (user) {
    res.redirect('/urls');
  }

  res.render('login', { user });
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  const user = findUserByCookie(users, req.session.userID);
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
  if (!user) {
    return res.status(403).send('Incorrect credentials.');
  }

  bcrypt.compare(password, user.password, (err, isMatching) => {
    if (!isMatching) {
      return res.status(403).send('Incorrect credentials.');
    }

    req.session.userID = user.id;
    res.redirect('/urls');
  });
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Missing email or password');
  }

  const existingUser = findUserByEmail(users, email);
  if (existingUser) {
    return res.status(400).send('Account already exists');
  }

  // hash and salt the plaintext password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    const id = generateRandomString();
    const newUser = {
      id,
      email,
      password: hashedPassword,
    };
    // update users database with object created here
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
