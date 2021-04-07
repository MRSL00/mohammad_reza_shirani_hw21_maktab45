const Article = require("../models/article");

const editProfileAcc = async (req, res, next) => {
  try {
    const article = await Article.find({
      _id: req.params.id,
    }).populate("author", { username: 1 });
    console.log(req.session.user.username);
    console.log(article[0].author.username);
    if (req.session.user.username === article[0].author.username) {
      return next();
    } else {
      return res.status(403).redirect("http://localhost:5000/403");
    }
  } catch (err) {
    conosole.log(err.message);
  }
};

const deleteProfileAcc = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const article = await Article.find({
      _id: req.params.id,
    }).populate("author", { username: 1 });
    if (
      req.session.user.username === article[0].author.username ||
      req.session.user.role === "admin"
    ) {
      return next();
    } else {
      return res.status(403).redirect("http://localhost:5000/403");
    }
  } catch (err) {
    conosole.log(err.message);
  }
};

module.exports = { editProfileAcc, deleteProfileAcc };
