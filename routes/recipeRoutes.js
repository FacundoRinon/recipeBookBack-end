const express = require("express");
const router = express.Router();
const multer = require("multer");

const recipeController = require("../controllers/recipeController");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { expressjwt: checkJwt } = require("express-jwt");
router.use(checkJwt({ secret: process.env.SESSION_SECRET, algorithms: ["HS256"] }));

router.get("/", recipeController.index);
router.get("/:id", recipeController.show);
router.get("/search/:category/:score/:votes", recipeController.category);
router.post("/", recipeController.store);
// router.post("/create", recipeController.create);
router.patch("/:id", upload.single("avatar"), recipeController.update);
router.patch("/score/:id", recipeController.rate);
router.delete("/:id", recipeController.destroy);

module.exports = router;
