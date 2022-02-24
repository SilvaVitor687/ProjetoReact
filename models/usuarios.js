const mongoose = require("mongoose"),
    Schema = mongoose.Schema;
const uniqueValidator = require ('mongoose-unique-validator');
const crypto = require ('crypto');
const jwt = require ('jwt');
const secret = require("../config").secret;


const UsuarioSchema = new mongoose.Schema ({
    nome: {
        type: String,
        required: [true, `O campo NOME não pode Ficar Vazio`]
    },

    email: {

        type: String,
        lowercase: true,
        unique: true,
        required: [true, `O campo E-mail Não Pode Ficar Vazio`],
        index: true,
        match: [/\S+@\S+\.\S+/, 'O formato de email é inválido.'] //Formato de Email para AJAX
    },

    loja: {
        type: Schema.Types.ObjectId,
        ref: "Loja",
        required: [true, `O campo Não Pode Ficar Vazio`]
    },

    permissao: {
        type: Array,
        default: ["cliente"]
    },
    

    hash: String,
    salt: String,
    recovery:{

        type: {
            token: String,
            date: Date

        },
        default: {}
    }
},  

    { timestamps: true}); 

UsuarioSchema.plugin(uniqueValidator, { message: "Esse usuário já estar sendo utilizado."});

UsuarioSchema.methods.setSenha = function(password) {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000,512, "sha512").toString ("hex");
};

UsuarioSchema.methods.validarSenha = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000,512, "sha512").toString ("hex");
    return hash === this.hash;
};

UsuarioSchema.methods.gerarToken = function() {
    const hoje  = new Date();
    const exp = new Date (today);
    exp.setDate(today.getDate() + 15);

    return jwt.sign({
        id: this._id,
        email: this.email,
        nome: this.nome,
        exp: parseFloat(exp.getTime() / 1000, 10)
    }, 
        secret);
    };

    UsuarioSchema.methods.enviarAuthJSON = function(){ 

        return { 
                _id: this._id, 
                nome: this.nome,  
                email: this.email, 
                loja: this.loja,  
                role: this.permissao,  
                token: this.gerarToken() 
        };
    };

 UsuarioSchema.methods.criarTokenRecuperarSenha = function() {
    this.recovery = {};
    this.recovery.token = crypto.randomBytes(16).toString("hex");
    this.recovery.date = new Date ( new Date().getTime()  + 24*60*60*1000);
    return this.recovery;
};

UsuarioSchema.methods.finalizarRecuperacaoDeSenha = function(){
    this.recovery = { token: null, date: null };
    return this.recovery;
};


    mongoose.exports = mongoose.model("Usuario", UsuarioSchema);


