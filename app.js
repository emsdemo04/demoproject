const express = require('express');
const app = express(); //Express method use
require('dotenv').config(); //.Env module require
const bodyParser = require('body-parser')
const router=require('./src/router/index'); //Require route path
const swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//Test api  
app.get('/',(req, res) => res.send('Notes App'));

//Router 
app.use('/api/v1', router);

//Swagger router
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const db = require("./src/model");
// db.sequelize.sync();
db.sequelize.sync().then(() => {
    console.log("Drop and re-sync db.");
});

//Listen server create
app.listen(process.env.PORT, () => console.log(`Server start port => 3000!`));