const express = require("express");
const postController = require("../controllers/postController");
const authProtect = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(authProtect, postController.getAllPosts).post(authProtect, postController.createPost)

router.route("/:id").get(authProtect, postController.getOnePost).patch(authProtect, postController.updatePost).delete(authProtect, postController.deletePost)

module.exports = router;