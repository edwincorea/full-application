"use strict";

var http = require("http"),
    express = require("express");
    
const app = express();

app.get("/", (request, response) => {
    response.end("Hello, World!");     
});

const server = new http.Server(app);

const port = 3000;
server.listen(port, () => {
    console.log(`Server up and running on port ${port}`);        
});