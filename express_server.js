const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser())




//Generates the Short URL unique ID
function generateRandomString() {
return Math.random().toString(36).substring(7)
};
//Generates the User unique ID
function generateRandomId() {
  return Math.random().toString(36).substring(7)
};






const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" } //compare userID cookies compared to USerID from this object
};

const userDatabase = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur" //bcrypt.hashSync('purple..' , saltRounds)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk" // same as above
  }
};







const findUserByEmail = function (email) {
for (let uniqueUser in userDatabase) {
  if (userDatabase[uniqueUser].email === email) {
    return userDatabase[uniqueUser];
  }
}
return false; 
};

const createNewUser = function (email, password) {
  const userId = generateRandomId();
  const newUser = {
    id: userId, 
    email,
    password, // bcrypt.hashSync(password, saltRounds)..go ajust authenticateUser
  };
  userDatabase[userId] = newUser;
  return userId
};

const authenticateUser = (email, password) => {
  const user = findUserByEmail(email);
  if (user && user.password === password) { //if (user && bcrypt.compareSync(password, user.password){
    return user;
  } else {
    return false;
  }
}








app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});






//EVERYTHING RELATED TO INDEX PAGE, SHORT LINK, /U, GET


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"]  
  let templateVars = { 
    user: userDatabase[userId], // FILTER STATEMENT ....OBJECT.keys(urlDatabase).filter 
    userId,
    urls: urlDatabase 
  }; 
  
  if (!userId) {
  res.render("urls_registration", templateVars)
  } else {
  res.render("urls_index", templateVars); 
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"]
  let templateVars = {
    user: userDatabase[userId], 
    userId,
  }
  if (!userId) {
    res.status(404).send("Sorry, you must be logged in to use this feature.")
  } else {
  res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"]
  let templateVars = { 
    user: userDatabase[userId], 
    userId,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const user = urlDatabase[req.params.shortURL].userID;
  if (longURL){
  res.redirect(longURL); 
  } else {
    res.status(404);
    res.end();
  }
});





//EVERYTHING RELATED TO THE LOG IN / REGISTER/ LOGOUT



app.get("/register", (req, res) => {
const userId = req.cookies["user_id"]
let templateVars = { user: null}  
res.render("urls_registration", templateVars);
});


app.post ("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email);
  if (!req.body.email || !req.body.password){
    res.status(404).send("You must fill the form.")
  }

  if (!user) {
    const userId = createNewUser(email, password);
    res.cookie('user_id', userId);
    res.redirect("/urls");
  } else{
    res.status(403).send('Oups! It seems you are already registered.')
  }
});

app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"]
  let templateVars = { user: null} // 
  res.render('urls_login', templateVars);
});


app.post("/login", (req, res) => {
 const email = req.body.email;
 const password = req.body.password;
 const user = authenticateUser(email, password);

 if (user) {
  res.cookie("user_id", user.id)
  res.redirect("/urls");
 } else {
  res.status(401).send("Oups! We think you may have the wrong credentials. Try logging in again.")
 }
})


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls")
})






//EVERYTHING RELATED TO THE POST SHORT URL, URLS



app.post("/urls/:shortURL", (req, res) => {
  const urltoUpdate =  req.params.shortURL;
  let newLongURL = req.body.longURL;
  const user = urlDatabase[req.params.shortURL].userID;
  urlDatabase[urltoUpdate] = newLongURL //{ long url & user ID}; 
  res.redirect("/urls");
  //if statement for the userID, don't create one if it exists; switch the url DataBase to the new database;
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})


app.post("/urls", (req, res) => {
  const tiny = generateRandomString() 
  const userId = req.cookies["user_id"]
  urlDatabase[tiny] = {
      longURL: req.body.longURL,
      userID: userId 
  }
  res.redirect(`/urls/${tiny}`)  
});










app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});