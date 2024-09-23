const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'Invalid token' });
    }

    const jwtToken = token.slice(7);

    try {
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        return res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
};

module.exports = authenticateToken;
