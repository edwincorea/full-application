import {test} from "shared/test";
import  _ from "lodash"; 

test();
const arr = [1, 2, 3, 4, 5];
console.log(_.filter(arr, a => a < 5));