const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded_token = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decoded_token.userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw 'Identifiant utilisateur incorrect';
        } else {
            next();
        }
    } catch {
        res.status(401).send(new Error('Requête invalide'));
    }
};
