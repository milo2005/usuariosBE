var express = require("express");
//Libreria para encriptar o desencriptar informacion
var crypto = require("crypto-js");
//Objeto que nos valida si la solicitud esta en rangod e tiempo
var validateTime = require("../util/validate-time");
//Libreria para crear y validar tokens
var jsonToken = require("jsonwebtoken");

var settings = require("../settings/settings");

var router = express.Router();

//Middleware en que selccionamos la coleccion antes de que se ejecute
// la solicutd
router.use(function(req,res,next){
    req.c = req.db.collection("usuarios");
    next();
});

//API para el registro de usuarios
// el cuerpo del usuario debe tener el campo auth
// auth = usuario&&password -> encriptado en AES
router.post("/signin", function(req, res, next){

    //Obtenemos el body de la solicitud
    var body = req.body;
    //Obtenemos auth
    var auth = body.auth;

    //Desencriptamos auth con la llave "cualquiercosa"
    auth = crypto.AES.decrypt(auth, settings.secret);
    auth = auth.toString(crypto.enc.Utf8);
    //Separando la cadena en cada &&
    auth = auth.split("&&");

    //PREPARAR EL OBJETO PARA INSERTARLO A LA BASE DE DATOS

    //Quitamos el campo auth 
    delete body.auth;
    //Obtenemos el usuario y se lo asignamos al objeto
    body.usuario = auth[0];
    //Obtenemos el password y se lo asignamos al objeto
    // Encriptamos con SHA la contraseña para que no sea entendible
    body.password = ""+crypto.SHA(auth[1]);
    //Insertamos el objeto
    req.c.insert(body, function(err, result){
        if(err){
            res.send({success:false});
        }else{
            res.send({success:true});
        }
    });
    
});


//Api para iniciar sesion
//El objeto debe tener el campo auth encriptado en AES
//auth = usuario&&password&&timestamp
//el password se manda encriptado en sha
router.post("/login", function(req,res,next){
    var body = req.body;
    var auth = body.auth;

    
    auth = crypto.AES.decrypt(auth,settings.secret);
    auth = auth.toString(crypto.enc.Utf8);
    auth = auth.split("&&");

    //Obtenemos el tercer campo que corresponde al timestamp de cuando 
    //  se envio la solicitud
    var timestamp = auth[2];

    //Validar si esta en rango de tiempo permitido
    if(validateTime.validate(timestamp)){
        //Buscar el usuario por el password y usuario.
        req.c.findOne({usuario:auth[0], password:auth[1]}
        , function(err, result){
            if(err || result == null){
                res.send({success:false});
            }else{
                //Crear el token donde especificamos la informacion y la clave
                //La informacion que puede ser un valor o un objeto
                var token = jsonToken.sign(result._id,settings.secret);
                res.send({success:true, token:token, usuario:result});
            }
        });
    }else{
        //Rango de tiempo no permitido, acceso denegado
        res.status(401).send({success:false
            , msg:"Error en solitud"});
    }
});


module.exports = router;