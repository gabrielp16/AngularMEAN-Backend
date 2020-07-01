var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// =================================
//  Obtener todos los hospital
// =================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    var paginacion = 5;

    Hospital.find({}) // Campos que se desean mostrar
        .skip(desde)
        .limit(paginacion)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospital',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });

                });

            });
});

// =================================
//  Obtener hospital por id
// =================================
app.get('/:idHospital', (req, res, next) => {

    var id = req.params.idHospital;

    Hospital.findById(id) // Campos que se desean mostrar
        .populate('usuario', 'nombre img email')
        .exec(
            (err, hospital) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospital',
                        errors: err
                    });
                }

                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El hospital con el id ' + id + 'no existe',
                        errors: {
                            message: 'No existe un hospital con ese ID'
                        }
                    });
                }

                res.status(200).json({
                    ok: true,
                    hospital: hospital
                });

            });
});


// =================================
//  Actualizar un hospital por el id
// =================================
app.put('/:idHospital', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.idHospital;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar un hospital',
                errors: err
            });
        }


        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe.',
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actaulizar un hospital',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

});


// =================================
//  Crear un nuevo hospital
// =================================
app.post('/', mdAutenticacion.verificarToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear un hospital nuevo',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});


// =================================
//  ELimiar un hospital por el id
// =================================
app.delete('/:idHospital', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.idHospital;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar un hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe.',
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});



module.exports = app;
