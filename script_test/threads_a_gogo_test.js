var cluster = require('cluster');
var numCPUs = 9;
function fibo (n) {
    return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
}
console.time('8 cluster');

let array = [];

// let numCPUs2 = require('os').cpus().length;
//
// console.log('numCPUs: ', numCPUs2);

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();
        worker.on('message', function(m) {
            array.push(m);
        })

    }

    cluster.on('exit', function(worker, code, signal) {
        if(!--numCPUs){
            // console.timeEnd('8 cluster');
            console.log(array);
            process.exit(0);
        }
    });
} else {
    process.send(fibo(cluster.worker.id + 30));
    process.exit(0);
}
