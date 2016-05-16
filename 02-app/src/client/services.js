//Singletons for all the instaces of the infraestructure: socket, wrapper over the socket, stores.

import io from "socket.io-client";

import {ObservableSocket} from "../shared/observable-socket"; 

export const socket = io({ autoConnect: false});
//observable socket
export const server = new ObservableSocket(socket);

//create playlist store
//create user store
//create chat store
 