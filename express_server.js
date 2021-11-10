const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  return Math.random().toString(16).substr(2, 6);
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  const templateVars = {
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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
