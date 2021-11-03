var express = require('express');
var router = express.Router();
var cors = require('cors')
const keycloak = require('../config/keycloak.js').getKeycloak();

import {app, authManager, corsOptions} from '../app'
import { RegistrationResultEnum } from '../logic/RegistrationResultEnum';
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
router.post('/login',  cors(corsOptions), async function(req:any, res:any){
    try{
        let user = await authManager.login(req.body.username, req.body.password)
        if(user){
          res.status(200).jsonp(user)
        }else{
          res.status(401).jsonp({message:"Invalid Credentials"});
        }                
  }catch(error){
    res.status(500).jsonp({message:"Internal Server Error"});
  }
});

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

router.post('/register', cors(corsOptions), async function(req:any, res:any, next:any) {
  // Se obtienen los parametros de entrada
  let username = req.body.username
  let rol = req.body.rol
  let password = req.body.password
  try{
    let result:RegistrationResultEnum = await authManager.register(username, rol, password)
    switch(result){
      case RegistrationResultEnum.Success:
        res.status(201).jsonp({message:"Successfully registered."})
        break
      case RegistrationResultEnum.DuplicatedUser:
        res.status(409).jsonp({message: "Duplicated User"})
        break
      case RegistrationResultEnum.InvalidUsernamme:
        res.status(400).jsonp({message: "Invalid Username"})
        break 
      default:
        res.status(500).jsonp({message: "Internal Server Error"})
        break
    }  
  }catch(error){
    console.log(error)
    res.status(500).jsonp({message: "Internal Error"});
  }
});

module.exports = router;
  
router.options('/login', cors(corsOptions)) // enable pre-flight request for DELETE request
router.options('/', cors(corsOptions)) // enable pre-flight request for DELETE request
