const mongoose = require("mongoose");
const Usuario = mongoose.model("Usuario");
//const enviarEmailRecovery = required("../helpers/email-recovery");

class UsuarioController {

    // Metodo GET
    index(req, res, next) {
        Usuario.findById(req.payload.id).then(usuario => {
            if(!usuario) return res.status(401).json({ errors: "Usuario não registrado." });
            return res.json({ usuario: usuario.enviarAuthJSON() });

        }).catch(next);
    }

    // Metodo GET ID
    show(req, res, next) {
        Usuario.findById(req.payload.id).populate({ path: "loja" }).then(usuario => {
            if(!usuario) return res.status(401).json({ errors: "Usuario não registrado." });
            return res.json({ 
                usuario: {
                    nome: usuario.nome,
                    email: usuario.email,
                    permissao: usuario.permissao,
                    loja: usuario.loja
                }                       
            });
        }).catch(next);
    }
    // Metodo POST de registrar
    store(req, res, next) {

        if(!nome ||  !email || !password ) return res.status(422).json({ errors: " Preencha todos os campos de cadastro. " });

        const { nome, email, password } = req.body;

        const usuario = new Usuario({ nome, email });
        usuario.setSenha(password);

        usuario.save().then(() => res.json({ usuario: usuario.enviarAuthJSON()}))
        .catch(next);
    }

    //Metodo PUT de atualização
    update(req, res, next){

        const { nome, email, password } = req.body;
            Usuario.findById(req.payload.id).then(usuario => {
                if(!usuario) return res.status(401).json({ errors: "Usuario não registrado." });
                if(typeof nome !== "undefined") usuario.nome = nome;
                if(typeof email !== "undefined") usuario.email = email;
                if(typeof password !== "undefined") usuario.setSenha(password);

                return usuario.save().then(() =>{
                    return res.json({ usuario: usuario.enviarAuthJSON() });
                })
            }).catch(next);                               
    }

    // Metodo de deletar
    remove(req, res, next) {
        Usuario.findById(req.payload.id).then(usuario => {
            if(!usuario) return res.status(401).json({ errors: "Usuario não registrado." });
            return usuario.remove().then(()=>{
                return res.json({ deletado: true });

            }).catch(next);
        }).catch(next);
    }

    //Metodo POST de Login
    login(req, res, next){
        const { email, password } = req.body;
            if(!email) return res.status(422).json({ errors: {email: "O campo E-mail não pode ficar vazio."}});
            if(!password) return res.status(422).json({ errors: {password: "O campo Senha não pode ficar vazio."}});
            Usuario.findOne({ email }).then((usuario) => {
                if(!usuario) return res.status(401).json({ errors: "Usuario não registrado." });
                if(!usuario.validarSenha(password)) return res.status(401).json({ errors: "Senha inválida"});
                return res.json({ usuario: usuario.enviarAuthJSON() });
            }).catch(next);
    }

    //Metodo Recovery  GET recuperar a senha.
    showRecovery(req, res, next) {
        return res.render('recovery', { error: null, success: null});
    }

    //Metodo POST recuperar Senha.
    createRecovery(req, res, next) {
        const {email} = req.body;
        if(!email) return res.render('recovery', {error: "Preencha com seu email.", success: null });

        Usuario.findOne({ email }).then((usuario) => {
            if(!usuario) return res.render("recovery", {error: "Não existe usuário com esse E-mail", success: null });
            const recoveryData = usuario.criarTokenRecuperacaoSenha();
            return usuario.save().then(() => {
                return res.render("recovery", { error: null, success: true });
            }).catch(next);
        }).catch(next);
    }

    //Metodo GET senha Recuperada
    showCompleteRecovery(req, res, next) {
        if(!req.query.token) return res.render("recovery", {error: "Token não identificado", success: null });
        Usuario.findOne({"recovery.token": req.query.token }).then(usuario => {
            if(!usuario) return res.render("recovery", {error: "Não existe usuário com esse E-mail", success: null });
            if (new Date(usuario.recovery.date) < new Date()) return res.render("recovery", { error: "Token expirado. Tente Novamente", success: null });
            return res.render("recovery/store", { error: null, success: null, token: req.query.token });
        }).catch(netx);
    }

    // Metodo POST Senha Recuperada
    CompleteRecovery(rq, res, next) {
        const { token, password } = req.body;
        if(!token || !password) return res.render("recovery/store", {error: "Preencha novamente com sua nova senha", success: null, token: token });

        Usuario.findOne({"recovery.token": token }).then(usuario => {
            if(!usuario) return res.render("recovery", {error: "Usuario não identificado", success: null });

            usuario.finalizarTokenRecuperacaoSenha();
            usuario.setSenha(password);
            return usuario.save().then(() => {
                return res.render("recovery/store", {
                    error: null,
                success: "Senha alterada com successo. Tente Novamente efetuar o login.",
                token: null

                });
            }).catch(next);
        });
    }
}

module.exports = UsuarioController;