var express = require('express');
var router = express.Router();
var database = require('./public/javascripts/DataBaseInterface');
var {sendDatatoQueue} = require('./public/javascripts/RabbitInterface')
var {isUsernameValid} = require('./public/javascripts/UsernameValidator')
var cors = require('cors')
var app = require('../../app');
const keycloak = require('../config/keycloak.js').getKeycloak();


/**
 * @swagger
 *    components:
 *        schemas:
 *           User:
 *             type: object
 *             properties:
 *               _id:
 *                   type: string
 *                   description: El ID del objeto.
 *                   example: 613b14eadd11665197679c14
 *               username:
 *                   type: string
 *                   description: El nombre de usuario.
 *                   example: Despacito
 *               key:
 *                   type: string
 *                   description: La clave para el storage personal del usuario
*/

const qs = require('qs')
const https = require('http');

 /**
 * @swagger
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Endpoint para loggearse.
 *     description: Endpoint para loggearse.
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         description: Indica el username.
 *         example: user1
 *         schema:
 *           type: string  
 *       - in: query
 *         name: password
 *         required: true
 *         description: Indica la contrasena.
 *         example: 1234
 *         schema:
 *           type: string  
 *     responses:
 *       200:
 *         description: El token de autenticacion.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  token:
 *                    type: string
 *                    description: Token de autenticacion
 *       404:
 *         description: Login fallido.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Mensaje de error
 *                    example: No user found
 *       500:
 *         description: Error desconocido.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: object
 *                    description: Error generado.
 * */
router.post('/login',  cors(app.corsOptions), async function(req, res){
    try{
        let query = {username: req.body.username}
        let user = await database.users.findOne(query);
        if(user ){

            let data =  {
                grant_type:"password",
                client_id:"karaoke-client",
                client_secret:"ba2939cf-e64c-4706-b578-349675e249b4",
                username:req.body.username,
                password:req.body.password
            }
            data=qs.stringify(data)

            const options = {
                hostname: '168.62.39.210',
                port: 8080,
                path: '/auth/realms/Karaoke-Realm/protocol/openid-connect/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }

            request(data,options,function(d){
                res.status(200).jsonp({token:d.access_token, username: user.username, key: user.key, rol: user.rol})
            })
        }else{
            res.status(404).jsonp({message:"No user found"});
        }
  }
  catch(error){
    res.status(500).jsonp({error});
  }
});

router.post('/create_user', function(req, res){
})

function get_admin_token (callback){
  let data =  {
      grant_type:"password",
      client_id:"karaoke-client",
      client_secret:"ba2939cf-e64c-4706-b578-349675e249b4",
      username:"creator",
      password:"creator1"
    }
  data=qs.stringify(data)
    
  const options = {
  hostname: '168.62.39.210',
  port: 8080,
  path: '/auth/realms/Karaoke-Realm/protocol/openid-connect/token',
  method: 'POST',
  headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
  }
  }
  request(data,options,function(d){
    callback(d.access_token)
  })

}

function create_user(username,token,callback){
  let data =  {
      enabled:"true", username
    }
  data= JSON.stringify(data)
  const options = {
  hostname: '168.62.39.210',
  port: 8080,
  path: '/auth/admin/realms/Karaoke-Realm/users',
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
      'Authorization':'Bearer '+token
  }
  }
  request(data,options,function(d){
    callback(d)
  })
}

function get_userid(username,token,callback){
  let data =  {}
  data= JSON.stringify(data)

  const options = {
  hostname: '168.62.39.210',
  port: 8080,
  path: '/auth/admin/realms/Karaoke-Realm/users?username='+username,
  method: 'GET',
  headers: {
      'Content-Type': 'application/json',
      'Authorization':'Bearer '+token
  }
  }
  
  
  request(data,options,function(d){
    callback(d[0].id)
  })
  

}

function set_rol(userid,rol,token,callback){
  let data = []
  if (rol =="user") {
      data =  [{
          id:"ee18091d-08be-484e-b7d5-220f4b0a39ed", name:"user_role"
        }]
  }else if (rol == "premium"){
      data =  [{
          id:"6eb321be-8f72-4b1b-8a8c-29c8ea6d84b1", name:"premium-role"
        }]
  }

  data= JSON.stringify(data)
  const options = {
  hostname: '168.62.39.210',
  port: 8080,
  path: '/auth/admin/realms/Karaoke-Realm/users/'+ userid+'/role-mappings/realm',
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
      'Authorization':'Bearer '+token
  }
  }
  
  request(data,options,function(d){
    callback(d)
  })
}

function set_password(userid,password,token,callback){

  let data =  { type: "password", temporary: false, value: password }

  data= JSON.stringify(data)
  const options = {
  hostname: '168.62.39.210',
  port: 8080,
  path: '/auth/admin/realms/Karaoke-Realm/users/'+ userid+'/reset-password',
  method: 'PUT',
  headers: {
      'Content-Type': 'application/json',
      'Authorization':'Bearer '+token
  }
  }
  
  request(data,options,function(d){
    callback(d)
  })
}


function request(data,options,callback){
 
  const reqs =  https.request(options,  rest => {
  let s=""
  rest.on('data',  d => {
    s += String(d);
          process.stdout.write(d);
      })
      
      rest.on('end', function () {
        try {
          s=JSON.parse(s.toString())
        } catch (error) {
          
        }
          callback(s)
        });
  })

  reqs.on('error', error => {
      s=error
  })
  reqs.write(data)
  reqs.end()

}


 /**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Endpoint para registrarse.
 *     description: Endpoint para registrarse.
 *     parameters:
 *       - in: body
 *         name: username
 *         required: true
 *         description: Indica el nombre de usuario.
 *         schema:
 *           type: string
 *           example: user1
 *       - in: body
 *         name: password
 *         required: true
 *         description: Indica la contraseña.
 *         schema:
 *           type: string
 *           example: 12345
 *     responses:
 *       201:
 *         description: Mensaje de exito.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Mensaje de exito
 *                    example: Successfully registered
 *       409:
 *         description: Error de usuario ya existente.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Mensaje de error
 *                    example: The username is already in use
 *       502:
 *         description: Error externo.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    description: Mensaje de error
 *                    example: An error ocurred on the creation of the users storage space. The registration was unsuccessful
 *       500:
 *         description: Error desconocido.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: object
 *                    description: Error generado.
 * */

router.post('/', cors(app.corsOptions), async function(req, res, next) {
    // Se obtienen los parametros de entrada
    let username = req.body.username
    let rol = req.body.rol
    try{
      // Se verifica si el usuario ya existe en la base de datos
      let user = await database.users.findOne({username});  

      if(user){
        res.status(409).jsonp({message:"The username is already in use."});
      }else if(!isUsernameValid(user)){
        res.status(400).jsonp({message:"The username is not valid."});
      }else{
        
        // Se genera el usuario en keycloak
        get_admin_token(function(token){
          create_user(req.body.username,token,function(rest){
              get_userid(req.body.username,token,function(userid){
                  set_rol(userid,req.body.rol,token,function(a){})
                  set_password(userid,req.body.password,token,function(b){
                  })
              })
          })
        })
        // Se agrega el usuario a la base de datos
        let result = await database.users.insertOne({username, rol})
        if(result.insertedId ){
          res.status(201).jsonp({message:"Successfully registered."});
        }else{
          res.status(502).jsonp({message:"An error ocurred on the database. The registration was unsuccessful"});
        }
        // Se genera la carpeta del usuario en el storage
        sendDatatoQueue("createFolder", JSON.stringify({"folder":username}))
      }
  
    }catch(error){
      console.log(error)
      res.status(500).jsonp({error: "Internal Error"});
    }
    
  });

  module.exports = router;
  module.exports.request = request;
  
  router.options('/login', cors(app.corsOptions)) // enable pre-flight request for DELETE request
  router.options('/', cors(app.corsOptions)) // enable pre-flight request for DELETE request
