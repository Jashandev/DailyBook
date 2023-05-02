var jwt = require("jsonwebtoken");
const JWT_SECRET = 'j@shan';

module.exports = function(req, res, next) {
    const token = req.header('token');
    if (token) {
        return jwt.verify(token, JWT_SECRET, function(err, decoded) {
            if (err) {
                return res.status(401).json({"error":"true","msg":"Unauthorized access"});
            }
            req.data = decoded;
            return next();
        });
    }
    return res.status(401).json({"error":"true","msg":"Unauthorized access"});
};