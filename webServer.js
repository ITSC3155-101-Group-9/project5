/*
 * Photo App web server.
 */

const fs = require("fs");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");

// Adjust these paths only if your project structure is different.
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

const app = express();

// ===============================
// MongoDB
// ===============================
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs3155", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ===============================
// Middleware
// ===============================
app.use(express.static(path.join(__dirname)));
app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(bodyParser.json());

// Multer for photo upload
const processFormBody = multer({
  storage: multer.memoryStorage(),
}).single("uploadedphoto");

// ===============================
// Helper: auth guard
// ===============================
function requireLogin(request, response, next) {
  if (!request.session.user_id) {
    response.status(401).send("Unauthorized");
    return;
  }
  next();
}

// Public routes that do NOT require login:
// POST /admin/login
// POST /admin/logout
// POST /user
//
// Everything else below uses requireLogin where needed.

// ===============================
// Admin/Login/Logout
// ===============================
app.post("/admin/login", async function (request, response) {
  try {
    const loginName = request.body.login_name;
    const password = request.body.password;

    if (!loginName || !password) {
      response.status(400).send("Missing login_name or password");
      return;
    }

    const user = await User.findOne({ login_name: loginName });

    if (!user) {
      response.status(400).send("Login failed: user not found");
      return;
    }

    if (user.password !== password) {
      response.status(400).send("Login failed: incorrect password");
      return;
    }

    request.session.user_id = user._id;
    request.session.login_name = user.login_name;

    response.status(200).send({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name,
    });
  } catch (err) {
    response.status(500).send(`Login error: ${err}`);
  }
});

app.post("/admin/logout", function (request, response) {
  if (!request.session.user_id) {
    response.status(400).send("No user is currently logged in");
    return;
  }

  request.session.destroy(function (err) {
    if (err) {
      response.status(500).send("Logout failed");
      return;
    }
    response.status(200).send("Logged out");
  });
});

// ===============================
// Registration
// ===============================
app.post("/user", async function (request, response) {
  try {
    const {
      login_name: loginName,
      password,
      first_name: firstName,
      last_name: lastName,
      location,
      description,
      occupation,
    } = request.body;

    if (!loginName || loginName.trim() === "") {
      response.status(400).send("login_name is required");
      return;
    }

    if (!password || password.trim() === "") {
      response.status(400).send("password is required");
      return;
    }

    if (!firstName || firstName.trim() === "") {
      response.status(400).send("first_name is required");
      return;
    }

    if (!lastName || lastName.trim() === "") {
      response.status(400).send("last_name is required");
      return;
    }

    const existingUser = await User.findOne({ login_name: loginName.trim() });

    if (existingUser) {
      response.status(400).send("login_name already exists");
      return;
    }

    const newUser = new User({
      login_name: loginName.trim(),
      password: password.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      location: location ? location.trim() : "",
      description: description ? description.trim() : "",
      occupation: occupation ? occupation.trim() : "",
    });

    await newUser.save();

    response.status(200).send({
      _id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      login_name: newUser.login_name,
    });
  } catch (err) {
    response.status(500).send(`Registration error: ${err}`);
  }
});

// ===============================
// Schema info
// ===============================
app.get("/test/info", requireLogin, async function (request, response) {
  try {
    const info = await SchemaInfo.findOne({});
    response.status(200).send(info);
  } catch (err) {
    response.status(500).send(`Error in /test/info: ${err}`);
  }
});

// ===============================
// User list
// ===============================
app.get("/user/list", requireLogin, async function (request, response) {
  try {
    const users = await User.find({}, "_id first_name last_name");
    response.status(200).send(users);
  } catch (err) {
    response.status(500).send(`Error in /user/list: ${err}`);
  }
});

// ===============================
// User detail
// ===============================
app.get("/user/:id", requireLogin, async function (request, response) {
  try {
    // ADD THIS:
    if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
      response.status(400).send("Invalid user ID");
      return;
    }

    const user = await User.findById(request.params.id, {
      _id: 1,
      first_name: 1,
      last_name: 1,
      location: 1,
      description: 1,
      occupation: 1,
    });

    if (!user) {
      response.status(400).send("User not found");
      return;
    }

    response.status(200).send(user);
  } catch (err) {
    response.status(400).send(`Error in /user/:id: ${err}`); // CHANGE 500 to 400
  }
});

// ===============================
// Photos of user
// ===============================
app.get("/photosOfUser/:id", requireLogin, async function (request, response) {
  try {
    if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
      response.status(400).send("Invalid photo ID");
      return;
    }

    const photos = await Photo.find({ user_id: request.params.id });

    const result = await Promise.all(
      photos.map(async (photo) => {
        const comments = await Promise.all(
          (photo.comments || []).map(async (comment) => {
            const commentUser = await User.findById(comment.user_id, "_id first_name last_name");

            return {
              _id: comment._id,
              comment: comment.comment,
              date_time: comment.date_time,
              user: commentUser
                ? {
                    _id: commentUser._id,
                    first_name: commentUser.first_name,
                    last_name: commentUser.last_name,
                  }
                : null,
            };
          })
        );

        return {
          _id: photo._id,
          user_id: photo.user_id,
          file_name: photo.file_name,
          date_time: photo.date_time,
          comments,
        };
      })
    );

    response.status(200).send(result);
  } catch (err) {
    response.status(400).send(`Error in /photosOfUser/:id: ${err}`);
  }
});

// ===============================
// Add comment to photo
// ===============================
app.post("/commentsOfPhoto/:photo_id", requireLogin, async function (request, response) {
  try {
    const commentText = request.body.comment;

    if (!commentText || commentText.trim() === "") {
      response.status(400).send("Comment cannot be empty");
      return;
    }

    const photo = await Photo.findById(request.params.photo_id);

    if (!photo) {
      response.status(400).send("Photo not found");
      return;
    }

    const newComment = {
      comment: commentText.trim(),
      date_time: new Date(),
      user_id: request.session.user_id,
    };

    if (!photo.comments) {
      photo.comments = [];
    }

    photo.comments.push(newComment);
    await photo.save();

    response.status(200).send(photo);
  } catch (err) {
    response.status(500).send(`Error in /commentsOfPhoto/:photo_id: ${err}`);
  }
});

// ===============================
// Upload new photo
// ===============================
app.post("/photos/new", requireLogin, function (request, response) {
  processFormBody(request, response, async function (err) {
    try {
      if (err || !request.file) {
        response.status(400).send("No file uploaded");
        return;
      }

      if (!request.file.mimetype.startsWith("image/")) {
        response.status(400).send("Uploaded file must be an image");
        return;
      }

      const timestamp = new Date().valueOf();
      const filename = "U" + String(timestamp) + request.file.originalname;

      const imagePath = path.join(__dirname, "images", filename);

      fs.writeFile(imagePath, request.file.buffer, async function (writeErr) {
        if (writeErr) {
          response.status(500).send("Failed to save uploaded file");
          return;
        }

        const newPhoto = new Photo({
          file_name: filename,
          date_time: new Date(),
          user_id: request.session.user_id,
          comments: [],
        });

        await newPhoto.save();
        response.status(200).send(newPhoto);
      });
    } catch (saveErr) {
      response.status(500).send(`Error in /photos/new: ${saveErr}`);
    }
  });
});

// ===============================
// Start server
// ===============================
const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(`Listening at http://localhost:${port}`);
});
