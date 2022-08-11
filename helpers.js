// find a user in the users object from its email
function getUserByEmail(email, database) {
  for (let userId in database) {
    if (email === database[userId].email) {
      return database[userId];
    }
  }
  return null;
}

module.exports = { getUserByEmail };