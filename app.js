// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');



// Inicializar variables
var app = express();


// Habilitar CORS - Access-Control-Allow-Origin
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});




//Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())




// Importar rutas
var appRoute = require('./routes/app');
var usuarioRoute = require('./routes/usuario');
var hospitalRoute = require('./routes/hospital');
var medicoRoute = require('./routes/medico');
var busquedaRoute = require('./routes/busqueda');
var uploadRoute = require('./routes/upload');
var imagenesRoute = require('./routes/imagenes');

var loginRoute = require('./routes/login');






// Conexion con la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});






// Rutas
app.use('/login', loginRoute);
app.use('/usuario', usuarioRoute);
app.use('/hospital', hospitalRoute);
app.use('/medico', medicoRoute);
app.use('/busqueda', busquedaRoute);
app.use('/upload', uploadRoute);
app.use('/imagenes', imagenesRoute);

app.use('/', appRoute);







// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});