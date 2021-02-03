if(process.env.NODE_ENV == 'production'){
    module.exports = {
        mongoURI: "mongodb+srv://samir:4Ptm5z4uy9nqTsk4@cluster0.wmczp.mongodb.net/Cluster0?retryWrites=true&w=majority"
    }
} else{
    module.exports = {
        mongoURI: "mongodb://localhost:8081/blogapp"
    }
}