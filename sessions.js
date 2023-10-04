const session = require("express-session");
const flash = require("express-flash");

module.exports = (app) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      name: "recipeBook",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        secure: false,
        httpOnly: true,
      },
    })
  );

  app.use(flash());
};
