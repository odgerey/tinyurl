const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
app.set("view engine", "ejs");


function generateRandomString() {
return Math.random().toString(36).substring(7)
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("Hello!");
});

// res.json = json.stringify(object) + res.send
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  console.log(req.cookies)
  let templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL){
  res.redirect(longURL);
  } else {
    res.status(404);
    res.end();
  }
});


app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls")
})

app.post("/urls/:shortURL", (req, res) => {
  const urltoUpdate =  req.params.shortURL;
  let newLongURL = req.body.longURL;
  urlDatabase[urltoUpdate] = newLongURL; 
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})


app.post("/urls", (req, res) => {
  const tiny = generateRandomString() 
  urlDatabase[tiny] = req.body.longURL
  res.redirect(`/urls/${tiny}`)  // Respond with 'Ok' (we will replace this)
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});