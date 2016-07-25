var express = require("express");
var router = express.Router();

router.get("/",function(req,res,next){
    var apellido = req.query.apellido;
    var nombre = req.query.nombre;
    

    res.send({msg:"metodo get", nombre:nombre+" "+apellido});
});

router.get("/:id",function(req,res,next){
    var id = req.params.id;
    res.send({msg:"metodo get", id:id});
});

router.post("/", function(req,res, next){
    res.send({msg:"metodo post"});
});

router.put("/:id", function(req,res,next){
    var id = req.params.id;
    res.send({msg:"metodo put", id:id});
});

router.delete("/:id", function(req, res, next){
    var id = req.params.id;
    res.send({msg:"metodo delete", id:id});
});



module.exports = router;