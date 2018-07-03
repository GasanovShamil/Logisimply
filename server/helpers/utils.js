var jwt = require('jsonwebtoken');

module.exports = {
    isLogged: function(req, res, next) {
        const bearerHeader = req.get('Authorization');
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            jwt.verify(bearerToken, 'zkfgjrezfj852', (err, decoded) => {
                if (err)
                    res.sendStatus(403);
                else {
                    req.loggedUser = decoded;
                    next();
                }
            });
        } else
            res.sendStatus(403);
    }
};