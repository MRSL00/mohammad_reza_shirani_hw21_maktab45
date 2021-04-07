const User = require("../../models/user");
const bcrypt = require("bcrypt");

const render_login = (req, res) => {
  res.render("auth/login", { err: req.flash("err") });
};

const postLogin = async (req, res) => {
  // ##################### check login inputs ##########################
  if (!req.body.username) {
    req.flash("err", "Please enter your Username");
    return res.status(400).redirect("login");
  } else if (!req.body.password) {
    req.flash("err", "Please enter your password");
    return res.status(400).redirect("login");
  }

  try {
    const { password, username } = req.body;
    const exsitUser = await User.findOne({ username: username });

    if (!exsitUser) {
      req.flash("err", "User not found!!!");
      return res.status(404).redirect("login");
    }

    bcrypt.compare(password, exsitUser.password, function (err, isMatch) {
      if (err) {
        req.flash("err", "Server err!!!");
        return res.status(500).redirect("login");
      }

      if (!isMatch) {
        req.flash("err", "Wrong password!!!");
        return res.status(404).redirect("login");
      }

      req.session.user = exsitUser;

      res.status(200).redirect("profile");
    });
  } catch (err) {
    req.flash("err", "Server err!!!");
    return res.status(500).redirect("login");
  }
};

const logout = (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/login");
  });
};

module.exports = { render_login, postLogin, logout };
