const express = require('express');
const cors = require('cors');
const uploadFile = require('express-fileupload');

const { createServer} = require('http');
const { Server: SocketServer } = require('socket.io');

const dotenv = require('dotenv');
dotenv.config();

class Server{

    constructor(){
        this.app= express();
        this.host = process.env.HOST;
        this.port = process.env.PORT;

        this.httpServer = createServer(this.app);

        this.io = new SocketServer(this.httpServer, {
            cors: {
                origin: "*",  // O especifícalo con la URL del frontend si es localhost
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type"],
                credentials: true
            }
        });

         //Middlewares
         this.middlewares();

         //Rutas
         this.routes();
         
        
    };

    middlewares() {
        //CORS
        this.app.use(cors({ origin: '*' }));
        //Parseo a json
        this.app.use(express.json());
        //file uploads-carga de archivos
        this.app.use(uploadFile({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            createParentPath: true
        }));
        // Middleware para hacer disponible io en los requests
        this.app.use((req, res, next) => {
            req.io = this.io;
            next();
        });
    };

    routes(){
        this.app.use('/proveedores', require('./routers/providers.routes'));
        this.app.use('/productos', require('./routers/products.routes'));
        this.app.use('/roles', require('./routers/roles.routes'));
        this.app.use('/usuarios', require('./routers/users.routes'));
        this.app.use('/login', require('./routers/auth.routes'));
       
    }

    Initiate(){
        return new Promise((resolve, reject) => {
            try {
                this.httpServer.listen(this.port, () => {
                    console.log(`\n${this.host}:${this.port}`);
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports= Server;