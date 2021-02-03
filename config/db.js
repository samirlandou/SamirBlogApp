if(process.env.NODE_ENV == 'production'){
    module.exports = {
        mongoURI: "mongodb+srv://samir:<password>@cluster0.wmczp.mongodb.net/<dbname>?retryWrites=true&w=majority"
    }
} else{
    module.exports = {
        mongoURI: "mongodb://localhost:27017/blogapp"
    }
}