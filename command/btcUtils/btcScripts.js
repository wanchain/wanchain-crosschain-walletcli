
let print4log = console.log;

let checkPasswd = (passwd) => {
    if (!passwd) {
       print4log('密码非空');
        return false;
    } else if (passwd && passwd.length <8) {
        print4log('密码最小长度为8');

        return false;
    } else {
        return true;
    }
};

let checkBalance = (amount, balance) => {
    if (amount && !balance) {
        let amountNum = amount * 1;
        if (isNaN(amountNum)) {
            print4log('请输入数字');
            return false;
        } else {
            return true
        }
    } else if (amount && balance) {
        let amountNum = amount * 1;
        if (isNaN(amountNum)) {
            print4log('请输入数字');
            return false;
        }else if (amount >= balance) {
            print4log('余额不足');
            return false;
        } else {
            return true
        }
    } else {
        print4log('amount非空');
        return false;
    }
};

module.exports = {checkPasswd, checkBalance};
