const express = require("express");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const { redirect } = require("express/lib/response");
const res = require("express/lib/response");
const app = express();
const PORT = 8080; // default port 8080

// middleware
app.set("view engine", "ejs");
app.use(cookieParser());

// translate the input data / request body 
app.use(express.urlencoded({ extended: true }));

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// store user: users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


// Generate a Random Short URL ID
function generateRandomString() {
  let randomString = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for ( let i = 0; i <6; i++ ) {
    randomString += characters.charAt(Math.floor(Math.random()*characters.length));
 }
 return randomString;

}

// find a user in the users object from its email
function getUserByEmail(email) {
  for (let userId in users) {
    if (email === users[userId].email) {
      return users[userId];
    }
  }
  return null;
}

// returns the URLs where the userID is equal to the id of the currently logged-in user.
function urlsForUser(userID) {
  const filteredURLs = {};
  for (let id in urlDatabase) {
    if (userID === urlDatabase[id].userID) {
      filteredURLs[id] = urlDatabase[id].longURL;
    }
  }
  return filteredURLs;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// only show the logged in user's URLs
app.get("/urls", (req, res) => {
  let userID = req.cookies.user_id;

  const templateVars = { 
    urls: urlsForUser(userID),
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

// show the new URL submission form 
app.get("/urls/new", (req, res) => {
  if (!users[req.cookies.user_id]) { // If the user is not logged in, redirect to GET /login
    res.redirect("/login");
    return;
  }
  
  // display the loggin email if logged in
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

// receive the url form submission，store new urls to database, and redirect to /urls/:id
app.post("/urls", (req, res) => {
  if (!users[req.cookies.user_id]) { // If the user is not logged in
    res.send("Please login first!");
    return;
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL]= {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  }
  res.redirect(`/urls/${shortURL}`);
 
});

// display the long URL and its shortened form
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.cookies.user_id;
  if (!urlDatabase[id]) {
    res.send("Short URL does not exist!");
    return;
  }

  if (!users[userID]) { // If the user is not logged in
    res.send("Please login or register first!");
    return;
  }

  const usersURL = urlsForUser(userID);


  for (let key in usersURL) {  // If the URL belongs to the user
    if (key === id) {
      const templateVars = { 
        id, 
        longURL: urlDatabase[id].longURL,
        user: users[userID]
      }
      res.render("urls_show", templateVars);
      return;
    } 
    
  }
  res.send("This is not your URL!");
});

  
// requests to the endpoint "/u/:id" will redirect to the webpage of its longURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;

  if (!urlDatabase[shortURL]) {
    res.send("Short URL does not exist!")
    return;
  }
  if (!longURL) {
    res.send("URL doesn't exist");
    return;
  }
  res.redirect(longURL);
});

// delete url and redirect to /urls
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userID = req.cookies.user_id;
  if (!urlDatabase[id]) {
    res.send("Short URL does not exist!");
    return;
  }

  if (!users[userID]) { // If the user is not logged in
    res.send("Please login or register first!");
    return;
  }

  const usersURL = urlsForUser(userID);

  for (let key in usersURL) {  // If the URL belongs to the user
    if (key === id) {
      delete urlDatabase[id];
      res.redirect("/urls");
    }
  } 
  res.send("This is not your URL!");
});

// edit route: edit the long URL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");

});

// login route - display the login page
app.get("/login", (req, res) => {
  if (users[req.cookies.user_id]) { // If the user is logged in, redirect to GET /urls
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("login", templateVars);
});

// handle login fomr data
app.post("/login", (req, res) => {
  const testEmial = req.body.email;
  const testPassword = req.body.password;
  const user = getUserByEmail(testEmial);

  if (user) { // check if user exist in database
    if (user.password === testPassword) { // check if password correct
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    } else {
      return res.status(403).send("Incorrect password.");
    }
  } else {
    return res.status(403).send("Please enter correct email address or register for an account!");
  }

  //res.redirect("/urls");
});

// logout route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// register route
app.get("/register", (req, res) => {
  if (users[req.cookies.user_id]) { // If the user is logged in, redirect to GET /urls
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("registration", templateVars);
});

// handles registration form data
app.post("/register", (req, res) => {


  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") { // error handler: when email or password is empty
    return res.status(400).send("Invalid email address or password.");
  }
  if (getUserByEmail(email)) { // error handler: when the input email is already exist in the users object
    return res.status(400).send("Email has been used.");
  }

  const hashedPassword = bcrypt.hashSync(password, 10); // hash the password
  console.log("hashedPw", hashedPassword)

  users[id] = { // store registation info to users 
    id,
    email,
    password: hashedPassword // store hashed password
  }
  console.log("users", users);

  res.cookie("user_id", id);
  res.redirect("/urls")
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

