const { faker } = require("@faker-js/faker");
const User = require("../models/User");
const usersDB = require("./usersDB");

module.exports = async () => {
  const users = [];

  for (let i = 0; i < 5; i++) {
    const name = faker.person.firstName();
    const lastname = faker.person.lastName();
    const email = faker.internet.email();
    const username = faker.internet.userName();
    users.push(
      new User({
        firstname: name,
        lastname: lastname,
        username: username,
        password: "1234",
        email: email,
        avatar: faker.internet.avatar(),
        followers: [],
        following: [],
        recipes: [],
      }),
    );
  }

  for (const userDB of usersDB) {
    const user = new User({
      _id: userDB._id,
      firstname: userDB.firstname,
      lastname: userDB.lastname,
      username: userDB.username,
      password: userDB.password,
      email: userDB.email,
      avatar: userDB.avatar,
      followers: [],
      following: [],
      recipes: [],
    });
    await user.save();
  }

  await User.insertMany(users);
};

console.log("[Database] Se corrio el seeder de Users.");
