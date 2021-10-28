const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    let token = req.header("x-token");
    if (!token) {
      return res.send("Token not Found");
    }
    let decode = jwt.verify(token, "jwtsecret");
    req.user = decode.user;
    next();
  } catch (err) {
    console.log(err);
    return res.send("Server Error");
  }
};
