const express = require("express");
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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    //console.log("user is: ", userId);
    //console.log("user email is: ", userId.email);
   // console.log("user email take 2: ", users[userId].email);
    if (email === users[userId].email) {
      return users[userId];
    }
  }
  return null;
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

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

// show the URL submission form 
app.get("/urls/new", (req, res) => {
  // display the username
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

// receive the url form submission，store new urls to database, and redirect to /urls/:id
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  //display the username
  res.redirect(`/urls/${shortURL}`);
 
});

// display the long URL and its shortened form
app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

// requests to the endpoint "/u/:id" will redirect to the webpage of its longURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (!longURL) {
    res.send("URL doesn't exist");
    return;
  }
  res.redirect(longURL);
});

// delete url and redirect to /urls
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// edit route: edit the long URL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");

});

// login route
app.post("/login", (req, res) => {
  //res.cookie("user_id", req.body.user_id); // set the cookie username to the input username
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
  users[id] = { // store registation info to users 
    id,
    email,
    password
  }
  console.log("users object is: ", users);
  res.cookie("user_id", id);
  res.redirect("/urls")
});

// login route - display the login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});