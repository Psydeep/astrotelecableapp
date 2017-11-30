//variable express: ingreso del framewordk, y su informacion que expone
var express = require('express');
var bodyParser = require('body-parser');
//variable/>>objeto app: -recarga la variable, la mayor parte del trabajo
var User = require("./models/user").User;
var session = require("express-session");
var router_app = require("./routes_app");
var mongoose = require('mongoose');
var Documento = require("./models/documentos");
var Publicacion = require("./models/publicaciones");
var session_middleware = require("./middlewares/session");
var formidable = require("express-formidable");
var RedisStore = require("connect-redis")(session);
var http = require("http");
var realtime = require("./realtime");
var mongoose_middleware = require('mongoose-middleware').initialize(mongoose);

var methodOverride = require("method-override");

var app = express();
var server = http.Server(app);

var sessionMiddleware = session({
    store: new RedisStore({}),
    secret: "astro ultra secret word"
});

realtime(server, sessionMiddleware);

app.use("/public", express.static("public"));
app.use(bodyParser.json()); //para peticiones aplication/json
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.get("/", function(req, res) {
    Publicacion.find()
        .sort('-1')
        .exec(function(err, publicacion) {
            if (err) { console.log(err); }
            res.render("index", { publicaciones: publicacion });
        });
});

/*---APP--*/


app.use(sessionMiddleware);

app.use(formidable.parse({ keepExtensions: true }));
//uso de Pug
app.set("view engine", "pug");


app.get("/", function(req, res) {
    console.log(req.session.user_id);
    res.render("index");
});


app.get("/signup", function(req, res) {
    User.find(function(err, doc) {
        console.log(doc);
        res.render("signup");
    });
});

app.get("/login", function(req, res) {
    res.render("login");
});

/*Otras rutas sin acceso a datos*/
app.get("/services", function(req, res) {
    res.render("services");
});
app.get("/contacts", function(req, res) {
    res.render("contacts");
});
app.get("/about", function(req, res) {
    res.render("about");
});
app.get("/queries", function(req, res) {
    res.render("queries");
});


app.post("/users", function(req, res) {
    var user = new User({
        email: req.body.email,
        password: req.body.password,
        password_confirmation: req.body.password_confirmation,
        username: req.body.username
    });

    //calback, guarda los datos en la base de datos
    user.save().then(function(us) {
        res.redirect("login");
        console.log(String("Usuario guardado exitosamente"));
    }, function(err) {
        if (err) {
            console.log(String(err));
            res.send("Error al guardar la información");
        }
    });
});

app.post("/sessions", function(req, res) {
    User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
            res.render("login", { error: 'Correo o contraseña invalido' }, console.log(String('Correo o contraseña invalido')));
        } else {
            if (req.body.password === user.password) {
                req.session.user_id = user._id;
                res.redirect("/app");
            } else {
                res.render("login", { error: 'Correo o contraseña invalido' }, console.log(String('Correo o contraseña invalido')));
            }
        }
    });
});

app.post("/logout", function(req, res) {
    req.session.destroy(function(err) {
        if (err) { console.log(err); } else {
            res.redirect('/');
        }
    });
});

app.use("/app", session_middleware);
app.use("/app", router_app);


//conectar al host:8080
server.listen(8082, function() {
    console.log("Servidor escuchando en el puerto 8082");
});