
let sendGroup = require('../crossSend/sendGroup/sendGroup.js').wanSend;
let ASyncLoopStack = require('../Algorithm/ASyncLoopStack.js');
let Topics = [ '510fae2572d2e276b099020f2f7d0de82b01f979408f8ef7818dded398908ee8',
    null,
    null,
    '0xe3049e440229e5addeb89341b22a5f896b04def20eac5e039438ef3369324e1a' ];
let address = '0xc145eba07fd35445dee9a7e47eededfcc35697a9';
let loop = new ASyncLoopStack(1,10000);
loop.EachFunc = function () {
    for (var i = 0; i < 10; ++i) {
        sendGroup.subscribe(address, Topics, function (err, result) {
            if (!err) {
                //transResult.tokenAddress = result;
            }
        });
        sendGroup.getScEvent(address, Topics, function (err, result) {
            if (!err && result) {
                //transResult.tokenAddress = result;
            }

        });
    }
    loop.stepNext();
};
loop.range = [1,10000];
setTimeout(function () {
    loop.run();
},100);
