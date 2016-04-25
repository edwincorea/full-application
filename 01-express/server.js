"use strict";

var http = require("http"),
    express = require("express");
    
const app = express();

app.set("view engine", "jade");

//Middlewares. Next is a callback to the next middleware or finally the request handler.
//Common middlewares flow:  Browser -> Node -> Express -> M1 -> M2 -> Handler
//Goes back like this:      Browser <- Node <- Express <- M1 <- M2 <- Handler
//Order of middlewares is important: 
//1. Custom Middlewares
//2. Static middleware
//3. Authentication middleware

app.use((request, response, next) => {
    console.log("--- In middleware 1");
    //response.write("Header"); 
    next();    
    console.log("--- Out of middleware 1");
});

//Serve out static files with Express static middleware
app.use(express.static("./public"));

app.use((request, response, next) => {
    console.log("--- In middleware 2");
    //response.write("Other"); 
    next();    
    console.log("--- Out of middleware 2");
});

app.get("/", (request, response) => {
    response.end("Hello, World!");
    console.log("In handler");     
});

app.get("/home", (request, response) => {
    response.render("index", {title: "Title!"});
});

const server = new http.Server(app);

const port = 3000;
server.listen(port, () => {
    console.log(`Server up and running on port ${port}`);        
});