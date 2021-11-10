const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "h2f7h3": {
    id: "h2f7h3",
    email: "spiderboy@example.com",
    password: "uncleben"
  },
  "h1k2j1": {
    id: "h1k2j1",
    email: "mj@example.com",
    password: "bugle"
  }
};

const generateRandomString = () => {
  return Math.random().toString(16).substr(2, 6);
};

const findUserByCookie = (userIdCookie) => {
  return users[userIdCookie];
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls', (req, res) => {
  const user = findUserByCookie(req.cookies.user_id);
  const templateVars = {
    user,
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const user = findUserByCookie(req.cookies.user_id);
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  const user = findUserByCookie(req.cookies.user_id);

  const templateVars = {
    user,
    shortURL,
    longURL: urlDatabase[shortURL]
  };

  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  // if shortURL doesn't exist in database, take to homepage for now
  if (!urlDatabase[shortURL]) return res.redirect('/');

  res.redirect(`${urlDatabase[shortURL]}`);
});

app.get('/register', (req, res) => {
  const user = findUserByCookie(req.cookies.user_id);

  const templateVars = {
    user
  };
  res.render('register', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const newUser = {
    id: generateRandomString(),
    email,
    password,
  };
  // update users object with object created here
  users[newUser.id] = newUser;

  res.cookie('user_id', newUser.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
