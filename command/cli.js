'use strict'


const frame = require('./frame.js');
const vorpal = require('vorpal')();
const wanUtil = require('wanchain-util');
// command: getStoremanGroups
vorpal
    .command('getStoremanGroupsSync', 'Get the useful storeman groups')
    .action(async function(args, callback) {
        this.log('getStoremanGroups');
        await frame.func(args);
        callback();
    });
vorpal
    .command('getStoremanGroups <coinID>', 'Get the useful storeman groups')
    .action(function(args, callback) {
        this.log('getStoremanGroups');
        frame.func(args);
        callback();
    });
vorpal
    .command('getNonceOf <address>', 'Get an address\'s nonce')
    .types({string:['_']})
    .action(function(args, callback) {
        this.log('getNonceOf');
        return frame.func(args);
        //callback();
    });
vorpal
    .command('sendWithdrawTransaction  <from>, <to>, <value>, <ethAddress>, [gas], [gasPrice]', 'sendWithdrawTransaction')
    .types({string:['_']})
    .validate(function(args){
        console.log("validate args: ", args);
        if(! wanUtil.isValidAddress(args.from)) {
            console.log('The field "from" is invalid');
            return false
        }
        if(! wanUtil.isValidAddress(args.to)) {
            console.log('The field "to" is invalid');
            return false
        }
        if(! wanUtil.isValidAddress(args.ethAddress)) {
            console.log('The field "ethAddress" is invalid');
            return false
        }
        return true
    })
    .action(function(args, callback) {
        this.log('sendWithdrawTransaction');
        frame.funcEvent(args);
        callback();
    });

vorpal
    .command('sendDepositTransaction <from>, <to>, <value>, <wanAddress>, [gas], [gasPrice]', 'send the Ethereum to storeman group account')
    .types({string:['_']})
    .help(function(args){
        this.log(" This command sendDepositTransaction");
    })
    .validate(function(args){
        console.log("validate args: ", args);
        if(! wanUtil.isValidAddress(args.from)) {
            console.log('The field "from" is invalid');
            return false
        }
        if(! wanUtil.isValidAddress(args.to)) {
            console.log('The field "to" is invalid');
            return false
        }
        if(! wanUtil.isValidAddress(args.wanAddress)) {
            console.log('The field "wanAddress" is invalid');
            return false
        }
        return true
    })
    .action(function(args, callback) {
        this.log('sendDepositTransaction');
        frame.funcEvent(args);
        callback();
    });

// list the pengding event message I haven't handled.
vorpal
    .command('pendingEvent', 'Outputs "vvv".')
    .action(function(args, callback) {
        this.log('pendingEvent');
        callback();
    });

vorpal
    .command('listEthAccounts', 'List Ethereum Accounts')
    .action(function(args, callback) {
        this.log('listEthAccounts: ',args);
        callback();
    });

vorpal
    .command('listWanAccounts', 'List Wanchain Accounts')
    .action(function(args, callback) {
        this.log('listWanAccounts');
        callback();
    });

frame.event.on('Event_Eth_withdrawed', function(e){
    console.log("your transaction done, please send X now")
})
frame.event.on('Event_WEth_deposited', function(e){
    console.log("your transaction done, please send X now")
})


vorpal
    .delimiter('walletCli$')
    .show();