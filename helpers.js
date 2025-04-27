const jwt = require("jsonwebtoken");
exports = {}
exports.getToken = async (email, user) => {
    const token = jwt.sign({ id: user._id }, "myworldmywish", { expiresIn: "1h" });

    return token;
};
module.exports = exports;