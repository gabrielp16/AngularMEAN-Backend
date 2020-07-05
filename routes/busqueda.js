var express = require('express');

var app = express();

var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');

// =================================
//  Busqueda por coleccion
// =================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, medicos, hospitales',
                error: {
                    message: 'Tipos de tabla / coleccion no valido'
                }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });

    });

});



// =================================
//  Busqueda general
// =================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Promise.all([
        buscarHospitales(busqueda, regex, desde),
        buscarMedicos(busqueda, regex, desde),
        buscarUsuarios(busqueda, regex, desde)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2],
        });

    });

});

// =================================
//  Promesas para cada coleccion
// =================================

function buscarHospitales(busqueda, regex, desde) {

    return new Promise((resolve, reject) => {

        var paginacion = 5;

        Hospital.find({ nombre: regex })
            .skip(desde)
            .limit(paginacion)
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });

    });

};

function buscarMedicos(busqueda, regex, desde) {

    return new Promise((resolve, reject) => {

        var paginacion = 5;

        Medico.find({ nombre: regex })
            .skip(desde)
            .limit(paginacion)
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });

    });

};

function buscarUsuarios(busqueda, regex, desde) {

    return new Promise((resolve, reject) => {

        var paginacion = 5;

        Usuario.find({}, 'nombre email role')
            .skip(desde)
            .limit(paginacion)
            .or([
                { 'nombre': regex },
                { 'email': regex }
            ])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });

    });

};

module.exports = app;
