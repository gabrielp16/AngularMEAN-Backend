var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

var app = express();

var Usuario = require('../models/usuario');

// =================================
//  Autenticacion con Google
// =================================

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });

    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        email_verified: payload.email_verified,
        at_hash: payload.at_hash,
        iss: payload.iss,
        google: true
    }
}


app.post('/google', async (req, res) => {


    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token invalido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal'
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //expiresIn: 4 horas

                res.status(200).json({
                    ok: true,
                    mensaje: 'Login correcto',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }

        } else {

            // El usuario no existe, hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = googleUser.google;
            usuario.password = ':)';

            usuario.save((err, usuario) => {
                var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); //expiresIn: 4 horas

                res.status(200).json({
                    ok: true,
                    mensaje: 'Login correcto',
                    usuario: usuario,
                    token: token,
                    id: usuario._id,
                    menu: obtenerMenu(usuario.role)
                });
            });
        }

    });

});



// =================================
//  Autenticacion basica
// =================================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }


        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }


        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token!!!
        usuarioDB.password = ':)';

        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //expiresIn: 4 horas

        res.status(200).json({
            ok: true,
            mensaje: 'Login correcto',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role)
        });
    });
});

function obtenerMenu(ROLE) {

    var menu = [
        {
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'Rxjs', url: '/rxjs-demo' },
                { titulo: 'Graficas', url: '/graficas1' }
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: []
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Medicos', url: '/medicos' });
        menu[1].submenu.unshift({ titulo: 'Hospitales', url: '/hospitales' });
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }

    return menu;
}

module.exports = app;