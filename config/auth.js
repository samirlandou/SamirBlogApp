const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//Carregar model do Usuário
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')


module.exports = function(passport){

    passport.use(new localStrategy({

        //colocar aqui o campo que vai ser analisado
        usernameField: 'email',
        passwordField: 'senha' //obrigatório porque no login.handlebars o name está
        //em português. se não tem que usar a palavra name="password"
        //<input type="password" class="form-control" name="senha" required>

    }, (email, senha, done) => {

        Usuario.findOne({
            email: email
        }).lean().then((usuario) => {
            
            if(!usuario){
                return done(null, false, { //done = função de callback
                    message: 'Esta conta não existe'
                })
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {

                if(batem){
                    return done(null, usuario)
                }else{
                    return done(null, false, {
                        message: 'Senha incorreta'
                    })
                }
            })

        })

    }))


    //Salvar os dados do usuário na sessão e logar
    passport.serializeUser((usuario, done) => {
        done(null, usuario)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (error, usuario) => {
            done(error, usuario)
        })
    })

}