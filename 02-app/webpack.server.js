var path = require("path"),
    fs = require("fs");
    
const nodeModules = fs.readdirSync("./node_modules").filter(d => d != ".bin");
function ignoreNodeModules(context, request, callback) {
    //include app modules into bundle: import {ChatModule} from "./components/chat"
    if (request[0] == "."){
        return callback();        
    }       
        
    //case when import {Subject} from "rxjs/Subject"
    const nodeModule = request.split("/")[0];
    if (nodeModules.indexOf(nodeModule) !== -1) {
        return callback(null, "commonjs " + request);        
    }
    
    return callback();        
}    

function createConfig(isDebug){
    return {
        target: "node",
        devtool: "source-map",
        entry: "./src/server/server.js",
        output: {
            path: path.join(__dirname, "build"),
            filename: "server.js"            
        },
        resolve: {
            alias: {
                shared: path.join(__dirname, "src", "shared")                
            }
        },
        module: {
            loaders: [
                {test: /\.js$/, loader: "babel", exclude: /node_modules/},
                {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
            ] 
        },
        externals: [ignoreNodeModules] 
    };    
}

module.exports = createConfig(true);
module.exports.create = createConfig; 