'use strict'

const pu = require('promisefy-util');
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
var readlineSync = require('readline-sync');
async function funcSync(args){
    console.log("someone call my func, args: ", args);
    await pu.sleep(6000);
}
async function func(args){
    console.log("someone call my func, args: ", args);
    let answer = await  readlineSync.question("input your password: ",{hideEchoBack: true});
    console.log("your password is: ", answer);
}
function funcEvent(args){
    console.log("someone call my funcEvent, args: ", args);
    setTimeout(function(){
        event.emit('Event_WEth_deposited')
    }, 5000)
}
exports.func = func;
exports.funcEvent = funcEvent;
exports.event = event;