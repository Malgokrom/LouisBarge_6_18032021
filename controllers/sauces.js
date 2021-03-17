const fs = require('fs');

const Sauce = require('../models/sauces');

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then((sauces) => {
        res.status(200).send(sauces);
    }).catch((error) => {
        res.status(500).send(new Error(error));
    });
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
        res.status(200).send(sauce);
    }).catch((error) => {
        res.status(500).send(new Error(error));
    });
};

exports.postSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: req.protocol + '://' + req.get('host') + '/images/' + req.file.filename,
        likes: 0,
        dislikes: 0
    });
    sauce.save().then(() => {
        res.status(201).json({ message: 'Sauce enregistrée'});
    }).catch((error) => {
        res.status(400).send(new Error(error));
    });
};

exports.putSauce = (req, res, next) => {
    const sauceObject = req.file ? {
            ...JSON.parse(req.body.sauce),
            imageUrl: req.protocol + '://' + req.get('host') + '/images/' + req.file.filename
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id }).then(() => {
        res.status(200).json({ message: 'Sauce modifiée'});
    }).catch((error) => {
        res.status(400).send(new Error(error));
    });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink('images/' + filename, () => {
            Sauce.deleteOne({ _id: req.params.id }).then(() => {
                res.status(200).json({ message: 'Sauce supprimée'});
            }).catch((error) => {
                res.status(400).send(new Error(error));
            });
        });
    }).catch((error) => {
        res.status(500).send(new Error(error));
    });
};

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
        if (req.body.like === 1 && sauce.usersLiked.indexOf(req.body.userId) === -1) {
            sauce.usersLiked.push(req.body.userId);
        } else if (req.body.like === -1 && sauce.usersDisliked.indexOf(req.body.userId) === -1) {
            sauce.usersDisliked.push(req.body.userId);
        } else {
            if (sauce.usersLiked.indexOf(req.body.userId) !== -1) {
                sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId), 1);
            }
            if (sauce.usersDisliked.indexOf(req.body.userId) !== -1) {
                sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.body.userId), 1);
            }
        }
        Sauce.updateOne({ _id: req.params.id }, {
            usersLiked: sauce.usersLiked,
            usersDisliked: sauce.usersDisliked,
            likes: sauce.usersLiked.length,
            dislikes: sauce.usersDisliked.length
        }).then(() => {
            res.status(200).json({ message: 'Sauce jugée'});
        }).catch((error) => {
            res.status(400).send(new Error(error)); 
        });
    }).catch((error) => {
        res.status(400).send(new Error(error));
    });
};
