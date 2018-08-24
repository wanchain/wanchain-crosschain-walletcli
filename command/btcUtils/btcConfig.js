module.exports = {
    'passwd': {
        type: 'password',
        name: 'password',
        message: 'Btc wallet Password: '
    },
    'amount': {
        type: 'input',
        name: 'amount',
        message: 'amount: '
    },
    'rate': {
        type: 'input',
        name: 'rate',
        message: 'Fee Rate(55cong): ',
        value: 55
    },
    'wanAddress':  {
        type: 'input',
        name: 'wanAddress',
        message: 'wanAddress: '
    },
    'to': {
        type: 'input',
        name: 'to',
        message: 'to: '
    },
    'createNewAddress': {
        desc: 'create new bitcoin address',
    },
    'addressList': {
        desc: 'get bitcoin address list'
    },
    'btcBalance': {
        desc: 'get bitcoin address balance'
    },
    'wbtcBalance': {
        desc: 'get wbtc address balance'
    },
    'wanBalance': {
        desc: 'get wan address balance'
    },
    'listStoreman': {
        desc: 'get all storeman'
    },
    'normalTransaction': {
        desc: 'bitcoin normal transaction'
    },
    'listTransaction': {
        desc: 'get all transasction'
    }

};
