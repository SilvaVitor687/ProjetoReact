module.exports = {

    secret: process.env.NODE_ENV === "production" ? process.env.SECRET : "AJRKEM0584YR84561AS89GSGN18S9D1",
    api: process.env.NODE_ENV === "production" ? "https://api.loja-teste.ampliee.com" : "http://localhost:3000",
    loja: process.env.NODE_ENV === "production" ? "https://loja-teste.ampliee.com" : "http://localhost:8000"
};