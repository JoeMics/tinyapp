const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "h2f7h3"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "h1k2j1"
  }
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

const findUserByEmail = (userDB, email) => {
  for (const user in userDB) {
    if (email === userDB[user].email) {
      return userDB[user];
    }
  }
};

const urlsForUser = (id) => {
  const userURLS = {};
  for (const url in urlDatabase) {
    // check to see if the url's userID === id
    if (urlDatabase[url].userID === id) {
      //  if it is, add it to the new object
      userURLS[url] = urlDatabase[url];
    }
  }
  return userURLS;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls', (req, res) => {
  const user = findUserByCookie(req.cookies.user_id);

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
    urls: urlsForUser(user.id),
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  // check if user is logged in before creating a url
  const user = findUserByCookie(req.cookies.user_id);
  
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
  const user = findUserByCookie(req.cookies.user_id);
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
  const user = findUserByCookie(req.cookies.user_id);
  // if user is not logged in, return 403
  if (!user) {
    return res.status(403).send("Error: must be logged in to edit short URLs");
  }
  // check if link doesn't belong to user, return 403
  const userURLS = urlsForUser(user.id);
  if (!userURLS[shortURL]) {
    return res.status(403).send("Error: You do not have access to this URL");
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
  const user = findUserByCookie(req.cookies.user_id);

  const templateVars = {
    user
  };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const user = findUserByCookie(req.cookies.user_id);
  const templateVars = {
    user
  };
  res.render('login', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  const user = findUserByCookie(req.cookies.user_id);
  // if user is not logged in, return 403
  if (!user) {
    return res.status(403).send("Error: must be logged in to delete URLs");
  }
  // check if link doesn't belong to user, return 403
  const userURLS = urlsForUser(user.id);
  if (!userURLS[shortURL]) {
    return res.status(403).send("Error: You do not have permissions to delete this URL");
  }
  
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const user = findUserByCookie(req.cookies.user_id);

  // if user is not logged in, return 403
  if (!user) {
    return res.status(403).send("Error: must be logged in to edit short URLs");
  }
  // check if link doesn't belong to user, return 403
  const userURLS = urlsForUser(user.id);
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
    return res.status(403).end();
  }
  // if found compare passwords
  if (password !== user.password) {
    // if they don't match, respond with 403
    return res.status(403).end();
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  //check to make sure email and pass are not empty strings
  if (email === '' || password === '') {
    return res.status(400).end();
  }
  // check to make sure email is not in users already
  if (findUserByEmail(users, email)) {
    return res.status(400).end();
  }

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
  res.clearCookie('user_id');
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
