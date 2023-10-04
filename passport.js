const passport = require("passport");
const LocalStrategy = require("passport-local");

module.exports = (app) => {
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async function (username, password, cd) {
        console.log("[LocalStrategy] Username:", username);
        console.log("[LocalStrategy] Password:", password);
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log("[Passport] Serialize User");
  });

  passport.deserializeUser(async (id, done) => {
    console.log("[Passport] Deserialize User");
  });
};
