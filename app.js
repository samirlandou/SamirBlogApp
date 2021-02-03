//------------------------Carregando Módulos: ---------------------------------
//Constante global
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash');

//Constante de rota
const admin = require("./routes/admin") //criar const. com o nome da rota
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuario')
//const passport = require('passport')

//Autenticação
const passport = require('passport')
require('./config/auth')(passport)
const db = require('./config/db')







//------------------------Configurações: --------------------------------------

    //Sessão
    app.use(session({
        secret: 'cursodenode',
        resave: true,
        saveUninitialized: true
    }))


    //Sessão - passport
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())


    //Flash - É um tipo de sessão que aparece só uma vez. bom para msg de erros
    app.use(flash()) //chamando aqui o flash


    //MiddleWare(da sessão) - Config / Define tbm as variáveis globais od sistema
    app.use((req, res, next) => {
        //criar aqui variável global com a palavra 'locals'
        res.locals.success_msg = req.flash('success_msg') //msg de sucesso
        res.locals.error_msg = req.flash('error_msg') //msg de erro
        res.locals.error = req.flash('error') //para mensagem do autenticação
        res.locals.user = req.user || null //armazena dados do usuário logado
        next() //passar o next aqui porque é um middleware.
    })


    //Bdy Parser:
    app.use(bodyParser.urlencoded({
        extended: true
    }))
    app.use(bodyParser.json())


    //HandleBars
    app.engine('handlebars', handlebars({
        defaultLayout: 'main'
    }))
    app.set('view engine', 'handlebars')


    //Mongoose
    mongoose.Promise = global.Promise;
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useUnifiedTopology', true);
    mongoose.connect(db.mongoURI, { 
        useNewUrlParser: true
    }).then(() => {
        console.log('Conectado ao MongoDB!');
    }).catch((error) => {
        console.log('Houve um erro ao se conectar ao MongoDB' + error);
    })


    //Public(Path)
    app.use(express.static(path.join(__dirname, "public")))


    //Public(MiddleWare da sessão/cookies valida sessão cada vez que a página é recarregada)
    app.use((req, res, next) => {
        console.log('Eu sou um MiddleWare...')
        next()
    })




//------------------------Rotas: ----------------------------------------------
    
    //Rotas principais
    app.get('/', (req, res) => {
        //res.send('RotaPrincipal')
        //res.render('index')
        Postagem.find().lean().populate('categoria').sort({
            data: 'desc'
        }).then((postagens) => {
            res.render('index', {
                postagens: postagens
            })
        }).catch((error) => {
            console.log('Erro ao listar categorias' + error);
            req.flash('error_msg', 'Houve um erro interno ao listar as categorias')
            res.redirect('/404')
        })
    })

    //Rota do erro 404
    app.get('/404', (req, res) => {
        res.send('ERRO 404!')
    })

    //posts
    app.get('/posts', (req, res) => {
        res.send('Lista Posts')
    })


    //encaminhar para um slug de postagens
    app.get('/postagens/:slug', (req, res) =>{
        Postagem.findOne({
            slug: req.params.slug
        }).lean().then((postagem) => {
            if(postagem){
                res.render('postagem/index', {
                    postagem: postagem
                })
            } else{
                req.flash('error_msg', 'Esta postagem não existe')
                res.redirect('/')
            }
        }).catch((error) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    })

    //Listar categorias
    app.get('/categorias', (req, res) =>{
        Categoria.find().lean().then((categorias) => {
            res.render('categorias/index', {
                categorias: categorias
            })
        }).catch((error) => {
            req.flash('error_msg', 'Houve um erro interno ao listar as categorias')
            res.redirect('/')
        })
    })


    //encaminhar da categorias para um slug de postagens
    app.get('/categorias/:slug', (req, res) =>{
        Categoria.findOne({
            slug: req.params.slug
        }).lean().then((categoria) => {
            
            if(categoria){
                Postagem.find({
                    categoria: categoria._id
                }).lean().then((postagens) => {
                    res.render('categorias/postagens', {
                        postagens: postagens,
                        categoria: categoria
                    })
                })
            } else{
                req.flash('error_msg', 'Esta categoria não existe')
                res.redirect('/')
            }
        }).catch((error) => {
            req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria')
            res.redirect('/')
        })
    })

    //Rota do Admin
    app.use('/admin', admin) //o '/admin é um prefixo



    //Usuários
    app.use('/usuarios', usuarios)

//------------------------Outros: ---------------------------------------------
    //Porta & Servidor  
    //const PORT = 8081
    const PORT = process.env.Port || 8081
    app.listen(PORT, () => {
        console.log("Servidor rodando na url http://localhost:8081");
    })