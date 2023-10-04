const { faker } = require("@faker-js/faker");
const User = require("../models/User");

// faker.setLocale = "es";

module.exports = async () => {
  const users = [];

  for (let i = 0; i < 50; i++) {
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

  //   for (const user of users) {
  //     const randomCount = Math.floor(Math.random() * users.length) + 1;
  //     for (let i = 0; i < randomCount; i++) {
  //       const randomIndex = Math.floor(Math.random() * user.length);
  //       if (users[randomIndex]._id !== user._id) {
  //         user.followers.push(users[randomIndex]._id);
  //       }
  //     }
  //   }

  await User.insertMany(users);
};

console.log("[Database] Se corrio el seeder de Users.");
