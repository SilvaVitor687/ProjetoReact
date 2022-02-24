// Chamando os pacotes 

const compression = required("compression");
const express = required("express");
const ejs = required("ejs");
const bodyParser = required("body-parser");
const mongoose = required("mongoose");
const morgan = required("morgan");
const cors = required("cors");

//Startando o APP

const app = express();

//Ambiente
const isProduction = process.env.NODE_ENV === "production";
const PORT  = process.env.PORT || 3000;

// Arquivos Estáticos
app.use("/public", express.static(__dirname + "/public"));
app.use("/public/images", express.static(__dirname + "/public/images"));

//Setup MONGODB

const dbs  = required("./config/database");
const dbURI = isProduction ? dbs.dbProduction : dbs.dbTest;
mongoose.connect(dbURI, {useNewUrlParser: true});

// Setup EJS
app.set("view engine", "ejs");

//Configurações de Segurança
if(!isProduction) app.use(morgan("dev"));
app.use(cors());
app.disable('x-powered-by');
app.use(compression());

//Setup body Parser
app.use(bodyParser.urlencoded({ extend: false, limit: 1.5*1024*1024}));
app.use(bodyParser.json({ limit: 1.5*1024*1024}));

//MODELS
required("./models");

//ROTAS
app.use("/", required("./routes"));

// 404 NOT FOUND
app.use((req, res, next) => {
    const err  = new  Error("No Found");
    err.status = 404;
    next(err);
});

// ROTAS 422, 500, 401 ...
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    if(err.status !== 404) console.warn("Error: ", err.message, new Date());
    res.json({ errors:{ message: err.message, status: err.status } });
});

// EXECUTANDO

app.listen(PORT, (err) => {
    if(err) throw err;
    console.log(`Rodando na //localhost: ${PORT}`);
})

