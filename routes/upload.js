var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');


var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

var extensionesValidas = [
    'png',
    'jpg',
    'jpeg',
    'gif'
];

var tipoColecciones = [
    'usuarios',
    'hospitales',
    'medicos'
];


// default options
app.use(fileUpload());



app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se ha seleccionado ningun archivo tipo imagen',
            error: {
                message: 'Debe seleccionar una imagen'
            }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen
    var nombreCortado = archivo.name.split('.')
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Validacion de extensiones que son permitidas
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            error: {
                message: 'Las extensiones validas son ' + extensionesValidas.join(', ')
            }
        });
    }

    // Validacion tipo de colecciones que son permitidas
    if (tipoColecciones.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            error: {
                message: 'Los tipos de coleccion validas son ' + tipoColecciones.join(', ')
            }
        });
    }

    // Nombre del archivo
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo a un path en especifico
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                error: err
            });
        }
    });

    subirPorTipo(tipo, id, nombreArchivo, res);

});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: {
                        message: 'El usuario con el id ' + id + ' no existe'
                    }
                });
            }
            var pathAnterior = './uploads/usuarios/' + usuario.img;

            // Si existe la imagen, la elimina
            if (fs.existsSync(pathAnterior)) {
                fs.unlinkSync(pathAnterior);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';  // Para que nos salga la contrasena

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del usuario fue actualizada',
                    usuario: usuarioActualizado
                });

            });

        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: {
                        message: 'El hospital con el id ' + id + ' no existe'
                    }
                });
            }

            var pathAnterior = './uploads/hospitales/' + hospital.img;

            // Si existe la imagen, la elimina
            if (fs.existsSync(pathAnterior)) {
                fs.unlinkSync(pathAnterior);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del hospital fue actualizada',
                    hospital: hospitalActualizado
                });

            });

        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: {
                        message: 'El medico con el id ' + id + ' no existe'
                    }
                });
            }

            var pathAnterior = './uploads/medicos/' + medico.img;
            // Si existe la imagen, la elimina
            if (fs.existsSync(pathAnterior)) {
                fs.unlinkSync(pathAnterior);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del medico fue actualizada',
                    medico: medicoActualizado
                });

            });

        });
    }
};


module.exports = app;
