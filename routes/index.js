const userRoutes = require("./userRoutes");
const recipeRoutes = require("./recipeRoutes");

module.exports = (app) => {
  app.use("/user", userRoutes);
  app.use("/recipes", recipeRoutes);
};
