var express = require("express");
var router = express.Router();
var mId = require("mongodb").ObjectId; //Sirve para crear objetos de Indentificadores
var validateToken = require("../util/validate-token");

//Middleware que se ejecuta cada que llega el parametro
//collection en la url
router.param("collection", function(req, res, next, c){
    req.c = req.db.collection(c);
    next(); //Continuamos en la siguiente etapa
});

//Post: publicar recurso
router.post("/:collection", validateToken, function(req, res, next){
    var obj = req.body; //Obtenemos el objeto a insertar
    //Insertamos el obj en mongo, w:1 requerimos una 
    // confirmacion (function)
    req.c.insert(obj,{w:1},function(err, result){
        if(err){
            //ERROR!, notificamos que no fue exitoso
           res.send({success:false}); 
        }else{
            //EXITOSO !!, notificamos que fue exitoso y retornamos la id del obj
            res.send({success:true, id:result.insertedIds[0]}); 
        }
    });
});

//DELETE: eliminar recurso
router.delete("/:collection/:id", validateToken, function(req, res, next){
    var id = new mId(req.params.id);
    req.c.deleteOne({_id:id}, function(err, result){
        if(err){
            res.send({success:false});
        }else{
            res.send({success:true});
        }
    });
});


//GET obtener recursos
router.get("/:collection", validateToken,  function(req, res, next){
    var q = req.query.q;
    var limit = req.query.limit;
    var skip = req.query.skip;
    var sort = req.query.sort;

    if(q){
        q = JSON.parse(q);
    }

    if(limit){
        limit = parseInt(limit);
    }else{
        limit = 0;
    }

    if(skip){
        skip = parseInt(skip);
    }else{
        skip = 0;
    }

    if(sort){
        sort = JSON.parse(sort);
    }

    req.c.find(q).limit(limit).skip(skip).sort(sort).toArray(function(err, results){
        if(err){
            res.send([]);
        }else{
            res.send(results);
        }
    });
});

router.get("/:collection/:id", validateToken, function(req, res, next){
    var id = new mId(req.params.id);
    req.c.findOne({_id:id}, function(err, result){

        if(err || result == null){
            //status nos permite especificar el codigo http
            res.status(404).send({msg:"No encontrado"});
        }else{
            res.send(result);
        }

    });

});

router.put("/:collection/:id",validateToken, function(req,res,next){
    var id =  new mId(req.params.id);
    var obj = req.body;
    req.c.update({_id:id}, {$set:obj}, function(err, results){
        if(err){
            res.send({success:false});
        }else{
            res.send({success:true});
        }
    });

});

//Agregar un item a un arreglo
//Body: {campo: obj} o {campo: [objs]}
//Ejemplo {"celulares":"325"}
router.put("/:collection/:id/push",validateToken,  function(req, res, next){
    var id = new mId(req.params.id);
    var obj = req.body;
    req.c.update({_id:id},{$push:obj}, function(err, result){
        if(err){
            res.send({success:false});
        }else{
            res.send({success:true});
        }
    });
});

//Eliminar un item de un arreglo
//Body: {campo:{criterio}}, {campo:valor}
// Ejemplo {"celulares":"301"}, {"mascotas":{"nombre":"luna"}}
router.put("/:collection/:id/pull",validateToken,  function(req, res, next){
    var id = new mId(req.params.id);
    var obj = req.body;
    req.c.update({_id:id}, {$pull:obj}, function(err, result){
        if(err){
            res.send({success:false});
        }else{
            res.send({success:true});
        }
    });
});



module.exports = router;