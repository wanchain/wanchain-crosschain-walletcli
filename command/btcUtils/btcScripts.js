
let print4log = console.log;

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
        }else if (amount >= balance) {
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

module.exports = {checkPasswd, checkBalance};
