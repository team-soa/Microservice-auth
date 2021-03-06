const keycloak = require('../applicationServices/config/keycloak').initKeycloak();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var swaggerJsdoc = require("swagger-jsdoc")
var swaggerUi = require("swagger-ui-express");
var session = require('express-session');

import { IAuthenticator } from "../applicationServices/auth/IAuthenticator";
import KeycloakAuthenticator from "../applicationServices/auth/KeycloakAuthenticator";
import IDataBase from "../applicationServices/database/IDataBase";
import MongoDataBase from "../applicationServices/database/MongoDataBase";
import HttpService from "../applicationServices/httpservices/HttpService";
import IHttpService from "../applicationServices/httpservices/IHttpService";
import { AuthManager } from "../domainServices/authManagers/AuthManager";
import IAuthManager from "../domainServices/authManagers/IAuthManager";
import IStorageCreator from "../domainServices/storageCreators/IStorageCreator";
import StorageCreator from "../domainServices/storageCreators/StorageCreator";
import IMessageExecuter from "../domainServices/executers/IMessageExecuter";
import UpdateUserKeyMessageExecuter from "../domainServices/executers/UpdateUserKeyMessageExecuter";
import UserKeyMessageExecuter from "../domainServices/executers/UserKeyMessageExecuter";
import MessageReceiver from "../applicationServices/messages/listener/MessageReceiver";
import IPreSender from "../applicationServices/messages/PreSender/IPreSender";
import IQueueSender from "../applicationServices/messages/senders/IQueueSender";
import RabbitSender from "../applicationServices/messages/senders/RabbitSender";
import IMessageReceiver from "../applicationServices/messages/listener/IMessageReceiver";
import QueuePreSender from "../applicationServices/messages/PreSender/QueuePreSender";

var usersRouter = require('../applicationServices/routes/users');

var corsOptions = {
  origin: ['*'],
  optionsSuccessStatus: 200
}

var app = express();

var memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

app.use(keycloak.middleware());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// app.js
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API de Karaoke TEC',
        version: '1.0.0',
        description:
            'Aplicacion para hacer CRUD de las canciones y autenticar al usuario',
        license: {
            name: 'Licensed Under MIT',
            url: 'https://spdx.org/licenses/MIT.html',
        }
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Development server',
        },
    ],
};

const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});
  
  // error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
  
  
const createFolderQueue = "createFolder"
const updateUserKeyResponseQueue = 'updateSongKey'
const updateUserKeyQueue = "updateUserKey"
const requestUserKeyQueue = "requestUserKey"
const rabbitHost = "amqp://"+<string>process.env.rabbit_url
const connectionString = <string>process.env.db_string 

let messageReceiver: IMessageReceiver = new MessageReceiver(rabbitHost);
let messageSender: IQueueSender = new RabbitSender(rabbitHost)
let createFolderPreSender: IPreSender = new QueuePreSender(messageSender, createFolderQueue)
let retrieveUserKey: IPreSender = new QueuePreSender(messageSender, updateUserKeyResponseQueue)
let database: IDataBase = new MongoDataBase(connectionString)
let httpService: IHttpService = new HttpService()
let authenticator: IAuthenticator = new KeycloakAuthenticator(httpService)
let storageCreator: IStorageCreator = new StorageCreator(createFolderPreSender)
let authManager: IAuthManager = new AuthManager(database, authenticator, storageCreator)
let updateUserKeyMessageExecuter:IMessageExecuter = new UpdateUserKeyMessageExecuter(database)
let getUserKeyMessageExecuter: IMessageExecuter = new UserKeyMessageExecuter(retrieveUserKey, database)
messageReceiver.setListener(updateUserKeyQueue, updateUserKeyMessageExecuter)
messageReceiver.setListener(requestUserKeyQueue, getUserKeyMessageExecuter)


export { app, corsOptions, authManager };