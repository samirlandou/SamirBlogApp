const mongoose = require('mongoose')
const Schema = mongoose.Schema


//Criando a tabela Categoria
const Categoria = new Schema({
    nome: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require:true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

//Criar a collection
mongoose.model("categorias", Categoria)



//------------------------Exportação: -----------------------------------------
module.exports = mongoose.model("categorias", Categoria)