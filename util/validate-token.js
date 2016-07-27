var jsonToken = require("jsonwebtoken");
var validateTime = require("./validate-time");
var crypto = require("crypto-js");
var settings = require("../settings/settings");

var validate = function(req, res, next){
    var token = req.get("Authorization");
    token = crypto.AES.decrypt(token, settings.secret);
    token = token.toString(crypto.enc.Utf8);
    token = token.split("&&");
    if(validateTime.validate(token[1])){
        jsonToken.verify(token[0], settings.secret, function(err, decoded){
            if(err){
                res.status(401).send({msg:"No authorizado"});        
            }else{
                req.id = decoded;
                next();
            }
        });
    }else{
        res.status(401).send({msg:"No authorizado"});
    }
};

module.exports = validate;