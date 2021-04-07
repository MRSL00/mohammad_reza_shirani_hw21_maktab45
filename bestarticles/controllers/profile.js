const User = require("../models/user");
const bcrypt = require("bcrypt");

const fs = require("fs");
const path = require("path");

const fieldsPattern = [
  "firstname",
  "lastname",
  "username",
  "email",
  "password",
  "gender",
  "mobile",
];

const render_profile = (req, res) => {
  res.render("profile/profile", { data: req.session.user });
};

const render_editPage = (req, res) => {
  res.render("profile/edit_profile", {
    data: req.session.user,
    succ: req.flash("succ"),
    err: req.flash("err"),
  });
};

const editProfile = (req, res) => {
  console.log(req.body);
  console.log(req.file);
  const bodyKeys = Object.keys(req.body);

  if (bodyKeys.length === 9) {
    bodyKeys.pop();
    bodyKeys.pop();
  } else if (bodyKeys.length === 8) {
    bodyKeys.pop();
  }
  const checkFieldsResult = fieldsPattern.every((field) =>
    bodyKeys.includes(field)
  );

  if (!checkFieldsResult || bodyKeys.length !== 7) {
    req.flash("err", "Server err!!! check your inputs");
    return res.status(400).json("err");
  }

  bcrypt.compare(
    req.body.password,
    req.session.user.password,
    async function (err, isMatch) {
      if (err) {
        req.flash("err", "Server err!!!");
        return res.status(500).json("err");
      }

      if (!req.body.password) {
        req.flash("err", "Please enter your password");
        return res.status(400).json("err");
      }

      if (!isMatch) {
        req.flash("err", "Wrong password!!!");
        return res.status(404).json("err");
      }

      if (req.body.password === req.body.newpassword) {
        req.flash("err", "Passwords are equl!!!");
        return res.status(400).json("err");
      }

      if (req.file) {
        if (req.session.user.avatar) {
          fs.unlink(
            path.join(
              __dirname,
              "../public/images/avatars",
              req.session.user.avatar
            ),
            (err) => {
              if (err) {
                req.flash("err", "Server Erorr!!!");
                res.status(500).json("err");
              }
            }
          );
        }
      }

      req.body.password = !req.body.newpassword
        ? req.body.password
        : req.body.newpassword;

      try {
        const userUpdate = await User.findOneAndUpdate(
          { _id: req.session.user._id },
          {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            gender: req.body.gender,
            mobile: req.body.mobile,
            lastUpdate: Date.now(),
            avatar: !req.file
              ? req.session.user.avatar
                ? req.session.user.avatar
                : undefined
              : req.file.filename,
          },
          { new: true }
        );
        
        userUpdate.save(async (err) => {
          
          if (err) {
            
            await User.findOneAndUpdate(
              { _id: req.session.user._id },
              req.session.user,
              { new: true }
            );
            const Err = [];
            
            err.message
              .substr(24)
              .split(",")
              .filter((el) => Err.push(el.split(":")[1].trim()));

            req.flash("err", Err);
            return res.status(400).json("err");
          }
          
          req.session.user = userUpdate;
          
          req.flash("succ", "Update was successful");

          res.status(200).json("succ");
        });
      } catch (err) {
        req.flash("err", "Server err!!!");
        return res.status(500).json("err");
      }
    }
  );
};

// const postAvatar = (req, res) => {
//   const uploud = UploadAvatar.single("avatar");

//   uploud(req, res, async function (err) {
//     if (err instanceof multer.MulterError) {
//       req.flash("err", "Server Erorr!!!");
//       res.status(500).redirect("http://localhost:500/profile/edit");
//     } else if (err) {
//       req.flash("err", err.message);
//       res.status(404).redirect("http://localhost:5000/profile/edit");
//     } else {
//       try {
//         const updateProfile = await User.findByIdAndUpdate(
//           req.session.user._id,
//           {
//             avatar: req.file.filename,
//             createdAt: req.session.user.createdAt,
//           },
//           { new: true }
//         );

//         if (req.session.user.avatar) {
//           fs.unlink(
//             path.join(
//               __dirname,
//               "../public/images/avatars",
//               req.session.user.avatar
//             ),
//             (err) => {
//               if (err) {
//                 req.flash("err", "Server Erorr!!!");
//                 res.status(500).redirect("err");
//               } else {
//                 req.session.user = updateProfile;
//                 req.flash("succ", "profile image Updated successful");
//                 res.status(200).redirect("http://localhost:5000/profile/edit");
//               }
//             }
//           );
//         } else {
//           req.session.user = updateProfile;
//           req.flash("succ", "profile image Updated successful");
//           res.status(200).redirect("http://localhost:5000/profile/edit");
//         }
//       } catch (err) {
//         req.flash("err", "Server Erorr!!!");
//         res.status(500).redirect("http://localhost:5000/profile/edit");
//       }
//     }
//   });
// };

module.exports = { render_editPage, render_profile, editProfile };
