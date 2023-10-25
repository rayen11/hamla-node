const express = require("express");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("./config/connect"); //
const User = require("./modules/user"); //
const Post = require("./modules/post"); //
const Filter = require("./modules/filter.js"); //

const app = express();
const cors = require("cors");
const { Error } = require("./config/connect");

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
var active_acount = "";
const PORT = process.env.PORT || 3000;

cloudinary.config({
  cloud_name: "dq1kpxxyl",
  api_key: "895693122276336",
  api_secret: "6Kgm17e3OwT4eWL3lxXcWFx-L50",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads", // Optional: Change the folder where the image will be stored on Cloudinary
    format: async (req, file) => "png", // Optional: Convert the image to a specific format (e.g., 'png')
    transformation: [
      { width: 1800, height: 1800, crop: "limit" }, // Set the maximum dimensions
    ],
  },
});

const upload = multer({ storage: storage });

app.post("/post-an-ad", upload.array("images", 20), async (req, res9) => {
  const post = new Post(req.body);
  post.image = req.files.map((file) => file.path);
  const dateActuelle = new Date();

  // Obtenez l'année, le mois et le jour de la date actuelle
  const annee = dateActuelle.getFullYear();
  const mois = (dateActuelle.getMonth() + 1).toString().padStart(2, "0"); // +1 car les mois commencent à 0
  const jour = dateActuelle.getDate().toString().padStart(2, "0");

  // Formatez la date dans le format "YYYY-MM-DD"
  const dateFormatee = `${annee}-${mois}-${jour}`;
  post.now = dateFormatee;
  post
    .save()
    .then((resulte) => {
      //res.send(savedUser)
      console.log("recu", resulte);

      User.findById(active_acount)
        .then((res) => {
          res.idss.push(resulte.id);
          User.findByIdAndUpdate({ _id: active_acount }, { idss: res.idss })
            .then((res4) => {
              console.log(res4);
              res9.send(res4);
            })
            .catch((err) => {
              console.log(err);
              res9.send(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("/check", (req, res) => {
  console.log(req.query.email);
  console.log(req.query.password);

  User.findOne({
    $and: [{ email: req.query.email }, { pass: req.query.password }],
  })
    .then((user) => {
      active_acount = user.id;

      res.send(user);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("/recherche", (req, res) => {
  console.log(req.query.recherche);
  num = parseInt(req.query.recherche);
  if (isNaN(num)) {
    num = 0;
  }

  Post.find({
    $or: [
      { title: { $regex: new RegExp(req.query.recherche, "i") } },
      { city: { $regex: new RegExp(req.query.recherche, "i") } },
      { price: num },
      { des: { $regex: new RegExp(req.query.recherche, "i") } },
      { number: num },
    ],
  })
    .then((post) => {
      res.send(post);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.post("/sing_up", (req, res) => {
  const user = new User(req.body);

  User.findOne({ $or: [{ email: user.email }, { phone: user.phone }] })
    .then((user1) => {
      if (user1) {
        // User with the same email or phone number exists
        res.send(null);
      } else {
        // User does not exist, save the new user
        user
          .save()
          .then((savedUser) => {
            res.send(savedUser);
            console.log("User saved", savedUser);
          })
          .catch((err) => {
            res.send(err);
            console.log("Error saving user", err);
          });
      }
    })
    .catch((err) => {
      res.send(err);
      console.log("Error finding user", err);
    });
});

app.get("/all", (req, res) => {
  Post.find()
    .then((resulte) => {
      res.send(resulte);
    })
    .catch((error) => {
      res.send(error);
    });
});
app.post("/lastest", (req, res) => {
  const filter = new Filter(req.body);
  console.log(filter);
  Post.find({
    now: { $gte: filter.date },
  })
    .then((posts) => {
      res.send(posts);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});
app.get("/my_posted", (req, res0) => {
  User.findById(active_acount)
    .then((res) => {
      const objectIds = res.idss.map((id) => new mongoose.Types.ObjectId(id));

      Post.find({ _id: { $in: objectIds } })
        .then((res5) => {
          res0.send(res5);
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});
app.get("/log_out", (req, res) => {
  active_acount = "";
});

app.post("/update", (req, res0) => {
  const post = new Post(req.body);
  const dateActuelle = new Date();

  // Obtenez l'année, le mois et le jour de la date actuelle
  const annee = dateActuelle.getFullYear();
  const mois = (dateActuelle.getMonth() + 1).toString().padStart(2, "0"); // +1 car les mois commencent à 0
  const jour = dateActuelle.getDate().toString().padStart(2, "0");

  // Formatez la date dans le format "YYYY-MM-DD"
  const dateFormatee = `${annee}-${mois}-${jour}`;
  post.now = dateFormatee;

  Post.findByIdAndUpdate({ _id: post.id }, post)
    .then((res) => {
      res0.send(res);
    })
    .catch((err) => {
      console.log(err);
      res0.status(404).send(err);
    });
});
app.post("/avence_recherche", (req, res0) => {
  const filter = new Filter(req.body);
  if (filter.date == "") {
    filter.date = 2098 - 10 - 28;
  }
  if (filter.ids == "") {
    Post.find({
      $or: [
        { date: { $gte: filter.date, $lte: 2099 - 10 - 28 } },
        { city: filter.city },
        { price: filter.price },
        { number: filter.number },
      ],
    })
      .then((res) => res0.send(res))
      .catch((err) => res0.status(404).send(err));
  } else {
    Post.findById(filter.ids)
      .then((res) => res0.send(res))
      .catch((err) => res0.status(404).send(err));
  }
});

app.delete("/delete/:id", (req, res) => {
  id = req.params.id;
  console.log(id);
  Post.findByIdAndDelete({ _id: id })
    .then((res1) => {
      res.status(200).send(res1);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send(err);
    });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
