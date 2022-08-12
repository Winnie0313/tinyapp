const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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


describe('getUserByEmail', function() {
  // to test that function returns a user object when it's provided with an email that exists in the database.
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, testUsers[expectedUserID]);
  });

  // to test that the function return null when email dosn't exsit in uders database
  it('should return null for email that does not exist', function() {
    const result = getUserByEmail("hahahah@example.com", testUsers)
    assert.strictEqual(result, null);
  });
});



