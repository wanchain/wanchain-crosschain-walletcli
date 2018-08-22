var tagg2 = require('tagg2'); //require the module

var th_func = function(){

    console.log('i am in thread,my file path is :' + __dirname);
    //in thread you can do some cpu hard work,such as fibo.

    thread.end("thread over");
    //when thread over, the string "thread over" will transfer to main nodejs thread.

}

var thread = tagg2.create(th_func, function(err, res){
    //var thread = tagg2.create(th_func, {buffer:buf}, callback); may transfer buffer to thread.

    if(err) throw(err);//thread occur some errors

    console.log(res);//this will be print "thread over"

    thread.destroy();//make suer to destory the thread which you have created

});
