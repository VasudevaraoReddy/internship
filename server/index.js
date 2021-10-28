const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const middleware = require("./middleware");
const app = express();
app.use(express.json());
app.use(cors());

app.listen(3001, () => {
  console.log("Server is Running");
});

const db = mysql.createPool({
  host: "109.106.254.51",
  user: "u183403375_vasureddy",
  password: "?2vSiZmx/:vI",
  database: "u183403375_vasu_Auth",
});

app.post("/register", async (request, response) => {
  const username = request.body.username;
  const password = request.body.password;
  const emailAddress = request.body.email;
  const fullName = request.body.fullName;
  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(request.body.password, 10);

  db.query(
    "SELECT * FROM users WHERE emailAddress = ? OR username = ?",
    [emailAddress, username],
    (err, result) => {
      if (result.length === 0) {
        db.query(
          "INSERT INTO users (id, username, password, fullName, emailAddress) VALUES(?,?,?,?,?)",
          [userId, username, hashedPassword, fullName, emailAddress],
          (err, result) => {
            console.log(err);
          }
        );
        response.send({ registrationMsg: "User Created Successfully" });
      } else {
        if (result[0].emailAddress === emailAddress) {
          response.send({ registrationMsg: "Email Id is Already Used" });
        } else {
          response.send({ registrationMsg: "Username Already exists" });
        }
      }
    }
  );
});

app.post("/login", async (request, response) => {
  const username = request.body.username;
  const password = request.body.password;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, result) => {
      if (err) {
        response.send({ error: err });
      }
      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, res) => {
          if (res) {
            let payload = {
              user: {
                id: result[0].id,
              },
            };
            jwt.sign(
              payload,
              "jwtsecret",
              { expiresIn: 3600000 },
              (error, token) => {
                if (error) {
                  response.send(error);
                } else {
                  response.send({ token: token });
                }
              }
            );
          } else {
            response.send({ userMsg: "Wrong Password" });
            response.status(400);
          }
        });
      } else {
        response.send({ userMsg: "Invalid User" });
      }
    }
  );
});

app.get("/profile", middleware, async (req, res) => {
  try {
    db.query(
      "SELECT * FROM users WHERE id = ?",
      [req.user.id],
      (err, result) => {
        if (err) {
          return res.send(err);
        } else {
          res.json(result);
        }
      }
    );
  } catch (err) {
    console.log(err);
    res.send("Server Error");
  }
});
