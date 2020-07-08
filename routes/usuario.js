var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// =================================
//  Obtener todos los usuarios
// =================================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    var paginacion = 5;

    Usuario.find({}, 'nombre email img role google') // Campos que se desean mostrar
        .skip(desde)
        .limit(paginacion)
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                Usuario.countDocuments({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });

                });

            });
});


// =================================
//  Actualizar un usuario por el id
// =================================
app.put('/:idUsuario', [mdAutenticacion.verificarToken, mdAutenticacion.verificarADMIN_ROLE_o_Mismo_Usuario], (req, res) => {

    var id = req.params.idUsuario;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar un usuario',
                errors: err
            });
        }



        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe.',
                errors: {
                    message: 'No existe un usuario con ese ID'
                }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actaulizar un usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';   // Para que al devolver no salga el password real.

            res.status(201).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });
    });
});


// =================================
//  Crear un nuevo usuario
// =================================
app.post('/', (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear un usuario nuevo',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });

    });

});


// =================================
//  ELimiar un usuario por el id
// =================================
app.delete('/:idUsuario', [mdAutenticacion.verificarToken, mdAutenticacion.verificarADMIN_ROLE], (req, res) => {

    var id = req.params.idUsuario;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar un usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No exite un usuario con ese ID',
                errors: {
                    message: 'No existe un usuario con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});



module.exports = app;
