const jwt = require('jsonwebtoken');
const config = process.env;

const verifyToken = async (req, res, next) => {
  const { token, uid } = req.headers;

  if (!token || !uid) {
    return res.status(403).send("A token/uid is required for authentication!");
  }

  try {
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    if (uid !== decoded.user_id) {
      return res.status(401).send("Invalid_Token/userId");
    }

    const verify = jwt.verify(token, config.TOKEN_KEY);
    if (verify.user_id !== uid) {
      return res.status(401).send("Invalid_Token/userId");
    }

    req.user = verify;
    next();
  } catch (e) {
    return res.status(401).send("Invalid_Token");
  }
};

module.exports = verifyToken;