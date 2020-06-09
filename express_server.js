const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL){
  res.redirect(longURL);
  } else {
    res.status(404);
    res.end();
  }
});


// app.post('/', function (req, res) {
//   res.send('POST request to the homepage')
// })
// save to the url database


app.post("/urls", (req, res) => {
  const tiny = generateRandomString() 
  urlDatabase[tiny] = req.body.longURL
  res.redirect(`/urls/${tiny}`)  // Respond with 'Ok' (we will replace this)
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});