import gulp from "gulp";
import webpack from "webpack";
import chalk from "chalk";
import rimraf from "rimraf";
import {create as createServerConfig} from "./webpack.server";
import {create as createClientConfig} from "./webpack.client";

const $ = require("gulp-load-plugins")();

// --------------------------------------
// Public tasks
gulp.task("clean:server", cb => rimraf("./build", cb));
gulp.task("clean:client", cb => rimraf("./public/build", cb));
gulp.task("clean", gulp.parallel("clean:server", "clean:client"));

gulp.task("dev:server", gulp.series("clean:server", devServerBuild));
gulp.task("dev", gulp
    .series(
        "clean", 
        devServerBuild, 
        gulp.parallel(
            devServerWatch, 
            devServerReload)));

gulp.task("prod:server", gulp.series("clean:server", prodServerBuild));
gulp.task("prod:client", gulp.series("clean:client", prodClientBuild));
gulp.task("prod", gulp.series("clean", gulp.parallel(prodServerBuild, prodClientBuild)));

// --------------------------------------
// Private Client tasks
function prodClientBuild(callback){
    const prodClientWebpack = webpack(createClientConfig(false));
    prodClientWebpack.run((error, stats) => {
        outputWebpack("prod:client", error, stats);
        callback();
    });       
}

// --------------------------------------
// Private Server tasks
const devServerWebpack = webpack(createServerConfig(true));

function devServerBuild(callback){
    devServerWebpack.run((error, stats) => {
        outputWebpack("dev:server", error, stats);
        callback();
    });    
}

function devServerWatch() {
    devServerWebpack.watch({}, (error, stats) => {
        outputWebpack("dev:server", error, stats);        
    });
}

function devServerReload() {
    return $.nodemon({
        script: "./build/server",
        watch: "./build",
        env: {
            "NODE_ENV": "development",
            "USE_WEBPACK": "true"
        }  
    });    
}

function prodServerBuild(callback){
    const prodServerWebpack = webpack(createServerConfig(false));
    prodServerWebpack.run((error, stats) => {
        outputWebpack("prod:server", error, stats);
        callback();
    });       
}

// --------------------------------------
// Helpers
function outputWebpack(label, error, stats){
    //operational errors due to configuration
    if(error)
        throw new Error(error);
    
    //stat errors (i.e. eslint)    
    if(stats.hasErrors()){
        $.util.log(stats.toString({colors: true}));
    } else {
        const time = stats.endTime - stats.startTime;
        $.util.log(chalk.bgGreen(`Built ${label} in ${time} ms`));                
    }
    
    $.util.log(stats.toString());
}
