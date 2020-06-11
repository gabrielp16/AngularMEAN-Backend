var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();


var Medico = require('../models/medico');

// =================================
//  Obtener todos los medico
// =================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    var paginacion = 5;

    Medico.find({}) // Campos que se desean mostrar
        .skip(desde)
        .limit(paginacion)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medico',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });

                });

            });
});


// =================================
//  Actualizar un medico por el id
// =================================
app.put('/:idMedico', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.idMedico;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar un medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe.',
                errors: {
                    message: 'No existe un medico con ese ID'
                }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actaulizar un medico',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                medico: medicoGuardado
            });

        });
    });
});

// =================================
//  Crear un nuevo medico
// =================================
app.post('/', mdAutenticacion.verificarToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear un medico nuevo',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });

});


// =================================
//  ELimiar un medico por el id
// =================================
app.delete('/:idMedico', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.idMedico;

    Medico.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar un medico',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe.',
                errors: {
                    message: 'No existe un medico con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            medico: hospitalBorrado
        });

    });

});



module.exports = app;
