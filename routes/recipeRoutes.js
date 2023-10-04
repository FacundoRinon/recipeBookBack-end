const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");

// const { expressjwt: checkJwt } = require("express-jwt");
// router.use(checkJwt({ secret: process.env.SESSION_SECRET, algorithms: ["HS256"] }));

// router.get("/", recipeController.index);
// router.get("/profile", recipeController.show);
// router.post("/", recipeController.store);
// router.post("/create", recipeController.create);
// router.update("/../", recipeController.edit);
// router.patch("/", recipeController.update);
// router.delete("/:id", recipeController.destroy);

module.exports = router;
