const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/login", userController.login);

const { expressjwt: checkJwt } = require("express-jwt");
router.use(checkJwt({ secret: process.env.SESSION_SECRET, algorithms: ["HS256"] }));

router.get("/", userController.index);
// router.get("/profile", userController.show);
router.get("/:id", userController.getUser);
router.post("/", userController.store);
// router.post("/create", userController.create);
// router.update("/../", userController.edit);
router.patch("/", userController.update);
router.patch("/:id", userController.follows);
router.patch("/book/:id", userController.addToBook);
// router.delete("/:id", userController.destroy);

module.exports = router;
