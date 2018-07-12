function CheckProcessExit(value) {
    if(value == 'Q' || value == 'q')
    {
        console.log('Exiting...');
        process.exit();
    }
    return true;
};
module.exports = {
    passwordPattern : '[^\u4e00-\u9fa5]+',
    floatPattern : /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.[\d]{1,18})$/,
    UintPattern : /^[1-9]\d*$/,
    YesNoPattern : /^y$|^Y$|^n$|^N$/,
    addressPattern: /^(0x)?[0-9a-fA-F]{40}$/,
    waddressPattern: /^(0x)?[0-9a-fA-F]{132}$/,
    hashPattern : /^(0x)?[0-9a-fA-F]{64}$/,
    lowerCasePattern: /^0x[0-9a-f]{40}$/,
    upperCasePattern: /^0x[0-9A-F]{40}$/,



    ExitConform(value){
        CheckProcessExit(value);
        return true;
    },
    patternCheck(value, pattern) {
        pattern = typeof pattern === 'string'
            ? pattern = new RegExp(pattern)
            : pattern;
        return pattern.test(value)
    }
}
