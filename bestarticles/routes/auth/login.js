const express = require("express");
const router = express.Router();
const { render_login, postLogin,logout } = require("../../controllers/auth/login");
const { CheckSession } = require("../../tools/general-tools");

router.get("/login", CheckSession, render_login);
router.get("/logout", logout);
router.post("/login", postLogin);

module.exports = router;
