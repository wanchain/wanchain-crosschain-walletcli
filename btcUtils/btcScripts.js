
let print4log = console.log;
let sprintf=require("sprintf-js").sprintf;

let checkPasswd = (passwd) => {
    if (!passwd) {
       print4log('password is empty');
        return false;
    } else if (passwd && passwd.length <8) {
        print4log('The minimum length of password is 8 ');

        return false;
    } else {
        return true;
    }
};

let checkBalance = (amount, balance) => {
    if (amount && !balance) {
        let amountNum = amount * 1;
        if (isNaN(amountNum)) {
            print4log('input the number');
            return false;
        } else {
            return true
        }
    } else if (amount && balance) {
        let amountNum = amount * 1;
        if (isNaN(amountNum)) {
            print4log('input the number');
            return false;
        }else if (amount > balance) {
            print4log('Not enough balance');
            return false;
        } else {
            return true
        }
    } else {
        print4log('amount is empty');
        return false;
    }
};

let timeStamp2String = function (time){
    let datetime = new Date();
    datetime.setTime(time);

    let year = datetime.getFullYear();

    let month = datetime.getMonth() + 1;
    if (month <10) month = '0' + month.toString();

    let date = datetime.getDate();
    if (date <10) date = '0' + date.toString();

    let hour = datetime.getHours();
    if (hour <10) hour = '0' + hour.toString();

    let minute = datetime.getMinutes();
    if (minute <10) minute = '0' + minute.toString();

    let second = datetime.getSeconds();
    if (second <10) second = '0' + second.toString();

    return year + "-" + month + "-" + date+" "+hour+":"+minute+":"+second;
};

let checkTransaction = (records, web3, hash160ToAddress) => {
    let showArray = [];

    records.forEach(function (array) {
        if (array.crossAdress === '') {
            return;
        }

        showArray.push(array);
    });

    let print;
    showArray.forEach(function(Array, index){

        print4log(config.consoleColor.COLOR_FgRed, sprintf("%10s %40s %40s %10s %10s", "from", "to", "value", "status", "chain"), '\x1b[0m');

        if (Array.chain.toLowerCase() === 'btc') {
            Array.valueStr = web3.toBigNumber(Array.value).div(100000000) + ' BTC';
            Array.destAddr = '0x' + Array.crossAdress;
        }else{
	        Array.valueStr = web3.toBigNumber(Array.value).div(100000000) + ' WBTC';
            Array.destAddr = hash160ToAddress(Array.crossAdress, 'pubkeyhash','testnet');
        }



        Array.timeStr = timeStamp2String(Array.time);
        Array.HTLCtimeStr = timeStamp2String(Array.HTLCtime);

        print = sprintf("%2s %10s %10s %10s %10s", (index +1) +': ' + Array.from, Array.destAddr, Array.valueStr, Array.status, Array.chain);
        print4log(config.consoleColor.COLOR_FgYellow, print, '\x1b[0m');

    });


    return showArray;
};

module.exports = {checkPasswd, checkBalance, checkTransaction};
