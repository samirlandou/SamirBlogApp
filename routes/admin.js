//------------------------Carregando Módulos: ---------------------------------
const express = require('express')
const router = express.Router()

//Usar o model 'Categoria' de forma externo
//const mongoose = require('mongoose')
//require("../models/Categoria") //Aponta ao caminho de Categoria
//const Categoria = mongoose.model('categorias') //Passa a referência do model
const Categoria = require("../models/Categoria")
const Postagem = require("../models/Postagem")
const {eAdmin} = require('../helpers/eAdmin')

//------------------------Rotas: ----------------------------------------------

//Página principal
router.get('/', eAdmin, (req, res) =>{ //'http://localhost:8081/admin/'
    //res.send("Pagina principal do painel ADM")
    res.render('admin/index')
})


/*------------------------------ Categoria --------------------------- */

//Página de Posts
router.get('/posts', eAdmin, (req, res) =>{ //'http://localhost:8081/admin/posts'
    res.send('Pagina do posts')
})


//Listar Categorias
router.get('/categorias', eAdmin, (req, res) =>{ //http://localhost:8081/admin/categorias
    //res.send("Pagina de categorias")
    //res.render('admin/categorias')
   Categoria.find().sort({
       date: 'desc'
   }).then((categorias) => {
        res.render('admin/categorias', {
            categoriaItem: categorias.map(Categoria => Categoria.toJSON())
        })
    }).catch((error) => {
        console.log("Erro ao listar nova Categoria: " + error)
        req.flash('error_msg', 'Houve um erro ao listar as categorias')
        res.redirect('/admin')
    })
})


//Adicionar Categorias
router.get('/categorias/add', eAdmin, (req, res) => { //http://localhost:8081/admin/categorias/add
    //res.send("Pagin a de categorias")
    res.render('admin/addcategorias')
})


//Editar Categorias
router.get('/categorias/edit/:id', eAdmin, (req, res) => {

    //Buscar a categoria pelo _id
    Categoria.findOne({
        _id: req.params.id
    }).lean().then((categoria) => {
        res.render('admin/editcategorias', {
            categoriaItem: categoria
        })
    }).catch((error) => {
        console.log("Erro ao editar Categoria: " + error)
        req.flash('error_msg', 'Esta categorias não existe')
        res.redirect('/admin/categorias')
    })

    //res.send('Página de Edição de Categoria')
    
})

//Editar - Salvar Categorias após Editar
router.post('/categorias/edit', eAdmin, (req, res) => {
    Categoria.findOne({
        _id: req.body.id
    }).then((categoria) => {

        var msgErrorsEdit = []
        
        if(!req.body.nome) {
            msgErrorsEdit.push({
                texto: 'Nome Inválido'
            })
        }

        if(!req.body.slug) {
            msgErrorsEdit.push({
                texto: 'Slug Inválido'
            })
        }

        if(req.body.nome.length != 0 && req.body.nome.length < 2){
            msgErrorsEdit.push({
                texto: 'Nome da Categoria é Muito Pequeno'
            })
        }
        
        if(msgErrorsEdit.length > 0){

            categoria.nome = categoria.nome,
            categoria.slug = categoria.slug

            res.render('admin/editcategorias', {
                erros: msgErrorsEdit
            })
        }else{

            categoria.nome = req.body.nome,
            categoria.slug = req.body.slug
    
            categoria.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso!')
                res.redirect('/admin/categorias') 
            }).catch((error) => {
                console.log("Erro ao salvar após editar Categoria: " + error)
                req.flash('error_msg', 'Houve um erro ao salvar a categoria')
                res.redirect('/admin/categorias')        
            })
        }

    }).catch((error) => {
        console.log("Erro ao buscar a Categoria: " + error)
        req.flash('error_msg', 'Houve um erro ao editar a categoria')
        res.redirect('/admin/categorias')     
    })
})


//Excluir Categoria
router.post('/categorias/deletar/:id', eAdmin, (req, res) => {
    Categoria.remove({
        _id: req.body.id
    }).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso')
        res.redirect('/admin/categorias') 
    }).catch((error) => {
        console.log("Erro ao excluir Categoria: " + error)
        req.flash('error_msg', 'Houve um erro ao deletar a categoria')
        //console.log('Erro ao deletou categoria!')
        res.redirect('/admin/categorias')
    })
})


//Salvar Nova categoria
router.post('/categorias/nova', eAdmin, (req, res) =>{
    
    var msgErrors = []

    //verificação do nome
    if(!req.body.nome 
        || typeof req.body.nome == undefined 
        ||req.body.nome == null){
            msgErrors.push({
                texto: 'Nome Inválido'
            })
    }

    //verificação do Slug
    if(!req.body.slug 
        || typeof req.body.slug == undefined 
        ||req.body.slug == null){
            msgErrors.push({
                texto: 'Slug Inválido'
            })
    }        
    
    //podemos validar assim tbm if(!req.body.nome || !req.body.slug) { code... }

    //verificação do tamanho do nome
    if(req.body.nome.length < 2){
        msgErrors.push({
            texto: 'Nome da Categoria é Muito Pequeno'
        })
    }

    /*if (req.body.slug.trim) {
        msgErrors.push({texto: "Slug Nao Pode Conter Espaços!"});
    }
    
    if (req.body.slug.toUpperCase) {
        msgErrors.push({texto: "Slug Nao Pode Conter Letras Maiúsculas!"});
    }*/

    //Verificar se o arrays contem dados de erros
    if(req.body.nome.length != 0 && msgErrors.length > 0){
        res.render('admin/addcategorias', {
            erros: msgErrors
        })
    } else{
        const novaCategoria = {
            nome: req.body.nome, //'nome' é referente ao atributo 'name' do <input>
            slug: req.body.slug //'slug' é referente ao atributo 'name' do <input>
        }
    
        new Categoria(novaCategoria).save().then(() => {
            //console.log('Categoria Salva com sucesso!');
            req.flash('success_msg', 'Categoria criada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((error) => {
            console.log("Erro ao salvar nova categoria: " + error)
            req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente')
            //console.log('Erro ao salvar categoria!')
            res.redirect('/admin')
        })
    }
})



/*------------------------------ Postagem --------------------------- */

//Listar Postagem
router.get('/postagens', eAdmin, (req, res) => {
    Postagem.find().lean().populate('categoria').sort({
        data: 'desc'
    }).then((postagens) => {
        res.render('admin/postagens', {
            postagens: postagens
        })
    }).catch((error) => {
        console.log('Erro ao listar postagens' + error);
        req.flash('error_msg', 'Houve um erro ao listar as postagens')
        res.redirect('/admin')
    })
})


//Adicionar Postagem
router.get("/postagens/add", eAdmin, (req, res) =>{
    Categoria.find().sort({name: "asc"}).then((categorias) => {

        //tem que mudar a forma que o json dá as infirmações na hora de renderizar
        res.render("admin/addpostagens", {
            categorias: categorias.map(Categoria => Categoria.toJSON())
        })
    }).catch((error) => {
        console.log("Erro ao adicionar nova postagem: " + error)
        req.flash('error_msg', 'Houve um erro ao carregar o formulário de postagem')
        res.redirect("/postagens");
    })
})



//Editar Postagem
router.get('/postagens/edit/:id', eAdmin, (req, res) => {
        
    //Buscar postagem pelo _id
    Postagem.findOne({
        _id: req.params.id
    }).lean().then((postagem) => {

        //Buscar categoria
        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagens', {
                categoriaItem: categorias,
                postagemItem: postagem
            })
        }).catch((error) => {
            console.log("Erro ao listar categoria dentro da postagens: " + error)
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/admin/postagens')
        })

    }).catch((error) => {
        console.log("Erro ao editar postagens: " + error)
        req.flash('error_msg', 'Houve um erro ao carregar o formulário de edição')
        res.redirect('/admin/postagens')
    })
})


//Salvar a postagem editado
router.post('/postagens/edit', eAdmin, (req, res) => {
    Postagem.findOne({
        _id: req.body.id
    }).then((postagem) => {

        //depois criar condição de validação antes de salvar.

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((error) => {
            console.log("Erro interno na edição da postagens: " + error)
            req.flash('error_msg', 'Houve um erro interno na edição da postagem')
            res.redirect('/admin/postagens')
        })

    }).catch((error) => {
        console.log("Erro ao salvar a edição da postagens: " + error)
        req.flash('error_msg', 'Houve um erro ao salvar a edição a postagem')
        res.redirect('admin/postagens')
    })
})


//Excluir Postagem
router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
    Postagem.remove({
        _id: req.params.id
    }).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso')
        res.redirect('/admin/postagens') 
    }).catch((error) => {
        console.log("Erro ao excluir Postagem: " + error)
        req.flash('error_msg', 'Houve um erro ao deletar a postagem')
        res.redirect('/admin/postagens')
    })
})


//Salvar Nova Postagem
router.post('/postagens/nova', eAdmin, (req, res) => {

    var msgErrosPostagens = []

    if(!req.body.titulo){
        msgErrosPostagens.push({
            texto: 'Título Inválido'
        })
    }

    if(!req.body.slug){
        msgErrosPostagens.push({
            texto: 'Slug Inválido'
        })
    }

    if(!req.body.descricao){
        msgErrosPostagens.push({
            texto: 'Descrição Inválido'
        })
    }

    if(!req.body.conteudo){
        msgErrosPostagens.push({
            texto: 'Conteúdo Inválido'
        })
    }

    if(req.body.categoria == "0"){
        msgErrosPostagens.push({
            texto: 'categoria invalida, registre uma categoria'
        })
    }

    if(msgErrosPostagens.length != 0 && msgErrosPostagens.length > 0){
        res.render('admin/postagens', {
            erros: msgErrosPostagens
        })
    } else{

        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        
        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((error) => {
            console.log('Erro ao salvar nova postagem: ' + error)
            req.flash('Error_msg', 'Houve um erro durante o salvamento da postagem')
            res.redirect('/admin/postagens')
        })

    }
})



//------------------------Exportação: -----------------------------------------
module.exports = router