//import $ from "jquery";
import {test} from "shared/test";
import "./application.scss";

test();

//$("body h1").html("Hei!!!");

if(module.hot) {
    module.hot.accept();
}