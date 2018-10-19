var bs58check = require('bs58check')
try {
    console.log(bs58check.decode('msqPpJpUUcKwMMe7TXDd2pb1ecoxDgUWGv'));
} catch (error) {
    console.log('BTC address is invalid.', error);
}
