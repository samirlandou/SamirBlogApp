const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    eAdmin: {
        type: Number,
        default: 0
    },
    senha: {
        type: String,
        required: true
    }
})


//Criar a collection
mongoose.model("usuarios", Usuario)



//------------------------Exportação: -----------------------------------------
module.exports = mongoose.model("usuarios",  Usuario)
