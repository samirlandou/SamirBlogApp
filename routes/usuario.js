//------------------------Carregando Módulos: ---------------------------------
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
//const Postagem = require("../models/Postagem")
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const {eAdmin} = require('../helpers/eAdmin')


//------------------------Rotas: ----------------------------------------------
router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {
    var errors = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        errors.push({
            texto: 'Nome inválido'
        })
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        errors.push({
            texto: 'E-mail inválido'
        })
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.email == null){
        errors.push({
            texto: 'Senha inválido'
        })
    }
    
    if(req.body.senha.length < 4){
        errors.push({
            texto: 'Senha muito curta'
        })
    }

    if(req.body.senha != req.body.senha2){
        errors.push({
            texto: 'As senhas são diferentes, tente novamente!'
        })
    }

    if(errors.length > 0){
        res.render('usuarios/registro', {
            errors: errors
        })
    }else{
        //verificar se o e-mail já existe
        Usuario.findOne({
            email: req.body.email
        }).lean().then((usuario) => {

            if(usuario){
                req.flash('error_msg', 'Ja existe uma conta com este e-mail no sistema')
                res.redirect('/usuarios/registro')
            }else{
                
                //hash da senha
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    eAdmin: 1
                })

                bcrypt.genSalt(10, (error, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (error, hash) => {
                        if(error){
                            console.log();
                            req.flash('error_msg', 'Houve um erro durante a salvamento do usuário')
                            res.redirect('/')
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuário criado com sucesso!')
                            res.redirect('/')                            
                        }).catch((err) => {
                            console.log('Houve um erro ao criar o usuário, tente novamente', error);
                            req.flash('error_msg', 'Houve um erro ao criar o usuário, tente novamente')
                            res.redirect('/usuarios/registro')                             
                        })
                    })
                })
            }
        }).catch((error) => {
            console.log('Houve um erro interno!', error);
            req.flash('error_msg', 'Houve um erro interno!')
            res.redirect('/')
        })
    }


})


//Rota pra o login
router.get('/login', (req, res) => {
    res.render('usuarios/login')
})

//Rota para login
router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
})


//Rota para logout
router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'Deslogado com sucesso!')
    res.redirect('/')
})

module.exports = router