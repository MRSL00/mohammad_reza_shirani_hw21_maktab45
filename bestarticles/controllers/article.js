const Article = require("../models/article");
const fs = require("fs");
const path = require("path");

// ################# show all articles ##################
const render_allarticlesPage = async (req, res) => {
  try {
    const num = +req.params.num;
    const page = +req.params.page;
    const number = await Article.count({});
    const articles = await Article.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * num)
      .limit(num)
      .populate("author", { username: 1 })
      .exec();

    res.render("article/allarticles.ejs", {
      data: req.session.user,
      articles: articles,
      countpage: Math.ceil(number / num),
      page: page,
    });
  } catch (err) {
    console.log(err.message);
  }
};
//################# create new article ######################
const render_createarticlePage = (req, res) => {
  res.render("article/createarticle.ejs", {
    data: req.session.user,
    err: req.flash("err"),
    succ: req.flash("succ"),
  });
};
const postCreateArticle = async (req, res) => {
  if (!req.file) {
    req.flash("err", "Please set a cover for article");
    return res.status(400).redirect("createarticle");
  }
  const newArticle = new Article({
    cover: req.file.filename,
    ...req.body,
    author: req.session.user._id,
  });
  try {
    const article = await newArticle.save();
    req.flash("succ", "Created successfuly");
    return res.status(200).redirect("createarticle");
  } catch (err) {
    const Err = [];

    err.message
      .substr(27)
      .split(",")
      .filter((el) => Err.push(el.split(":")[1].trim()));
    req.flash("err", Err);

    return res.status(400).redirect("createarticle");
  }
};

// ############### show login users articles ######################
const render_myarticlesPage = async (req, res) => {
  try {
    const num = +req.params.num;
    const page = +req.params.page;
    const number = await Article.count({ author: req.session.user._id });

    const articles = await Article.find({ author: req.session.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * num)
      .limit(num)
      .populate("author", { username: 1 })
      .exec();

    res.render("article/myarticles.ejs", {
      data: req.session.user,
      articles: articles,
      countpage: Math.ceil(number / num),
      page: page,
    });
  } catch (err) {
    console.log(err.message);
  }
};
const render_EditArticlePage = async (req, res) => {
  try {
    const article = await Article.find({
      _id: req.params.id,
    });

    res.render("article/editarticle.ejs", {
      data: req.session.user,
      article: article,
      err: req.flash("err"),
      succ: req.flash("succ"),
    });
  } catch (err) {
    const Err = [];

    err.message
      .substr(27)
      .split(",")
      .filter((el) => Err.push(el.split(":")[1].trim()));
    req.flash("err", Err);

    return res
      .status(400)
      .redirect(`http://localhost:5000/article/edit/${req.params.id}`);
  }
};
// edit article
const EditArticle = async (req, res) => {
  try {
    if (!req.body.title || !req.body.content) {
      req.flash("err", "Your article should be have content and title");
      return res.status(400).json("err");
    }
    const article = await Article.find({
      _id: req.params.id,
    });

    if (req.file) {
      fs.unlink(
        path.join(__dirname, "../public/images/covers", article[0].cover),
        (err) => {
          if (err) {
            req.flash("err", "Server Erorr!!!");
            res.status(500).json("err");
          }
        }
      );
    }
    const artUpdate = await Article.findOneAndUpdate(
      { _id: req.params.id },
      {
        ...req.body,
        createdAt: article[0].createdAt,
        lastUpdate: Date.now(),
        cover: !req.file ? article[0].cover : req.file.filename,
      },
      { new: true }
    );
    req.flash("succ", "Update was successful");
    res.status(200).json("succ");
  } catch (err) {
    req.flash("err", "Server Erorr!!!");
    res.status(500).json("err");
  }
};
// delete article
const DeleteArticle = async (req, res) => {
  try {
    const del_article = await Article.findOneAndDelete({ _id: req.params.id });

    fs.unlink(
      path.join(__dirname, "../public/images/covers", del_article.cover),
      (err) => {
        if (err) {
          req.flash("err", "Server Erorr!!!");
          res.status(500).json("err");
        }
      }
    );
    res.status(200).json("succ");
  } catch (err) {
    req.flash("err", "Server Erorr!!!");
    res.status(500).json("err");
  }
};

// ###################### read article page ############################
const render_showarticlePage = async (req, res) => {
  try {
    const article = await Article.find({ _id: req.params.id });
    

    const checkViews = article[0].viewer.map(
      (el) => el[0] === req.session.user.username
    );
    
    if (!checkViews.includes(true)) {
      await Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { viewer: req.session.user.username } },
        { new: true }
      );
    }

    res.render("article/showarticle.ejs", {
      data: req.session.user,
      article: article,
    });
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  render_allarticlesPage,
  render_createarticlePage,
  render_myarticlesPage,
  render_showarticlePage,
  postCreateArticle,
  render_EditArticlePage,
  EditArticle,
  DeleteArticle,
};
