// find a user in the users object from its email
function getUserByEmail(email, database) {
  for (let userId in database) {
    if (email === database[userId].email) {
      return database[userId];
    }
  }
  return null;
}

// Generate a Random Short URL ID
function generateRandomString() {
  let randomString = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( let i = 0; i < 6; i++ ) {
    randomString += characters.charAt(Math.floor(Math.random()*characters.length));
 }
 return randomString;
}

// returns the URLs where the userID is equal to the id of the currently logged-in user.
function urlsForUser(userID, urlDatabase) {
  const filteredURLs = {};
  for (let id in urlDatabase) {
    if (userID === urlDatabase[id].userID) {
      filteredURLs[id] = urlDatabase[id].longURL;
    }
  }
  return filteredURLs;
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser };