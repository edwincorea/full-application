//general validation rules for an user, run both on server and client

import {Validator} from "../validator";

export let USERNAME_REGEX = /^[\w\d_-]+$/; //allow words, digits and _ -

export function validateLogin(username) {
    const validator = new Validator();

    if (username.length >= 20)
        validator.error("Username must be fewer than 20 characters");

    if(!USERNAME_REGEX.test(username))        
        validator.error("Username can only containt letters, numbers, underscores and dashes");

    return validator;        
}

