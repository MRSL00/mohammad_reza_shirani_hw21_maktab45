const express = require("express");
const router = express.Router();
const { UploadCover } = require("../tools/general-tools");
const { editProfileAcc, deleteProfileAcc } = require("../tools/acc");

const {
  render_allarticlesPage,
  render_createarticlePage,
  render_myarticlesPage,
  render_showarticlePage,
  postCreateArticle,
  render_EditArticlePage,
  EditArticle,
  DeleteArticle,
} = require("../controllers/article");

router.get("/allarticles/:page/:num", render_allarticlesPage);

router.get("/createarticle", render_createarticlePage);
router.post("/createarticle", UploadCover.single("cover"), postCreateArticle);

router.get("/myarticles/:page/:num", render_myarticlesPage);
router.get("/article/edit/:id", editProfileAcc, render_EditArticlePage);
router.put(
  "/article/edit/:id",
  editProfileAcc,
  UploadCover.single("cover"),
  EditArticle
);
router.delete("/article/:id", deleteProfileAcc, DeleteArticle);

router.get("/article/:id", render_showarticlePage);

router.get("/403", (req, res) => {
  res.render("403Page.ejs");
});

module.exports = router;
