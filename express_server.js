const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

//Generates the Short URL unique ID
function generateRandomString() {
return Math.random().toString(36).substring(7)
};
//Generates the User unique ID
function generateRandomId() {
  return Math.random().toString(36).substring(7)
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const findUserByEmail = function (email) {
for (let uniqueUser of userDatabase) {
  if (userDatabase[uniqueUser].email === email) {
    return usersDatabase[uniqueUser];
  }
}
return false; 
};

const createNewUser = function (name, email, password) {
  const userId = generateRandomId();
  const newUser = {
    id: userId, 
    email,
    password,
  };
  userDatabase[userId] = newUser;
  return userId
};

//Express extensions used by my APP 
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser())

//Not needed
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



// res.json = json.stringify(object) + res.send
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    userId: req.cookies["user_id"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    userId: req.cookies["user_id"]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    userId: req.cookies["user_id"],
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

app.get("/register", (req, res) => {
  let templateVars = {
    userId: req.cookies["user_id"]
  }
  res.render("urls_registration", templateVars);
});

//WHY IS IT GENERATING A NEW STRING INTO THE SHORT STRING
app.post ("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
 
  const user = findUserByEmail(email);
  if (!user) {
    const userId = createNewUser(name, email, password);
    res.cookie('user_id', userId);
    res.redirect("/urls");
  } else {
    res.status(403).send('Oups! It seems you are already registered.')
    setTimeout(function(){
      res.redirect("/urls")
    }, 10000);
  }
});

app.post("/login", (req, res) => {
//const loggedInUser = userDatabase[userId];
//WHY IS REQ.BODY.USERNAME STILL AN OBJECT
console.log(req.body)
  res.cookie("user_id", req.body.email);
  res.redirect("/urls")
})


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
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