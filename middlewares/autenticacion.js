var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// =================================
//  Verificar token
// =================================
exports.verificarToken = function (req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
    });

}

// =================================
//  Verificar Role ADMIN_ROLE
// =================================
exports.verificarADMIN_ROLE = function (req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();

        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: {
                message: 'No es administrador, no tienes permisos para realizar esta accion'
            }
        });
    }
}

// =================================
//  Verificar Role ADMIN_ROLE y si es el mismo usuario
// =================================
exports.verificarADMIN_ROLE_o_Mismo_Usuario = function (req, res, next) {

    var usuario = req.usuario;
    var id = req.params.idUsuario;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();

        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador ni es el mismo usuario',
            errors: {
                message: 'No es administrador, no tienes permisos para realizar esta accion'
            }
        });
    }
}