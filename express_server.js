const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cookieSession = require('cookie-session')


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['authorized', '']
}))


function generateRandomString() {
return Math.random().toString(36).substring(7)
};

function generateRandomId() {
  return Math.random().toString(36).substring(7)
};


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const userDatabase = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds), 
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("meatlover", saltRounds), 
  }
};



const findUserByEmail = function (email, database) {
for (let uniqueUser in database) {
  if (database[uniqueUser].email === email) {
    return database[uniqueUser];
  }
}
return false; 
};

const createNewUser = function (email, password) {
  const userId = generateRandomId();
  const newUser = {
    id: userId, 
    email,
    password: bcrypt.hashSync(password, saltRounds), 
  };
  userDatabase[userId] = newUser;
  return userId;
};

const authenticateUser = (email, password) => {
  const user = findUserByEmail(email);
  if (user && bcrypt.compareSync(password, user.password)) { 
    return user;
  } else {
    return false;
  }
};




app.get("/urls", (req, res) => {
  const urlsForUser = function (mySpecificUser) {
    let userURLS = {};  
    for (let shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === mySpecificUser) {
        userURLS[shortURL] = urlDatabase[shortURL];
      }
    }
    return userURLS;
  };

  const userId = req.session.user_id;  
  let userURLS = urlsForUser(req.session.user_id);
  let templateVars = { 
    urls: userURLS,
    user: userDatabase[userId], 
    userId,
  }; 
  if (!userId) {
  res.render("urls_registration", templateVars);
  } else {
  res.render("urls_index", templateVars); 
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  let templateVars = {
    user: userDatabase[userId], 
    userId,
  }
  if (!userId) {
   res.redirect("/errors");
  } else {
  res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  let templateVars = { 
    user: userDatabase[userId], 
    userId,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL 
  }
  if (!userId){
    res.redirect("/errors");
  } else { 
  res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
 // const user = urlDatabase[req.params.shortURL].userID;
  if (longURL){
    res.redirect(longURL); 
  } else {
    res.redirect("/errors");
    res.end();
  }
});

app.get("/errors", (req, res) => {
  const userId = req.session.user_id;
  let templateVars = { user: null};
  res.render("urls_errors", templateVars);
});


app.get("/register", (req, res) => {
const userId = req.session.user_id;
let templateVars = { user: null };
res.render("urls_registration", templateVars);
});


app.post ("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, userDatabase);
  if (!req.body.email || !req.body.password) {
    res.redirect("/errors");
  }

  if (!user) {
    const userId = createNewUser(email, password);
    req.session.user_id = userId;
    res.redirect("/urls");
  } else{
    res.redirect("/errors");
  }
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  let templateVars = { user: null };
  res.render('urls_login', templateVars);
});


app.post("/login", (req, res) => {
 const email = req.body.email;
 const password = req.body.password;
 const user = authenticateUser(email, password);

 if (user) {
  req.session.user_id = user.id;
  res.redirect("/urls");
 } else {
  res.redirect("/errors");
 }
});

app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/urls");
});


app.post("/urls/:shortURL", (req, res) => {
  const urltoUpdate =  req.params.shortURL;
  let newLongURL = req.body.longURL;
  const user = urlDatabase[req.params.shortURL].userID;
  urlDatabase[urltoUpdate].longURL = newLongURL; 
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.redirect("/errors");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});


app.post("/urls", (req, res) => {
  const tiny = generateRandomString(); 
  const userId = req.session.user_id;
  urlDatabase[tiny] = {
      longURL: req.body.longURL,
      userID: userId, 
  }
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});