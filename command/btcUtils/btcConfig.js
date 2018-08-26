module.exports = {
    'help': '====== Type help for more information.  ====== ',
    'waiting': 'waiting for a moment...',
    'btcPasswd': {
        type: 'password',
        name: 'btcPassword',
        message: 'Input the BTC wallet Password(minimum 8 characters): '
    },
    'wanPasswd': {
        type: 'password',
        name: 'wanPassword',
        message: 'Input the wanchain address Password: '
    },
    'amount': {
        type: 'input',
        name: 'amount',
        message: 'input transaction bitcoin amount: '
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
        message: 'wanAddress(input index or address): '
    },
    'btcAddress':  {
        type: 'input',
        name: 'btcAddress',
        message: 'btcAddress(input index or address): '
    },
    'to': {
        type: 'input',
        name: 'to',
        message: 'Input bitcoin recipient address: '
    },
    'StoremanGroup': {
        type: 'input',
        name: 'storeman',
        message: 'StoremanGroup(input index or StoremanGroup): '
    },
    'btcRedeemHash':  {
        type: 'input',
        name: 'redeemHash',
        message: 'redeem hash: '
    },
    'revokeBtcHash':  {
        type: 'input',
        name: 'revokeHash',
        message: 'Input the index of transaction you want to revoke: '
    },
    'createNewAddress': {
        desc: 'create new bitcoin address',
        notice: '====== notice: 创建多个address时，密码必须与第一个address相同  ====== ',
        error: 'create btc address error'
    },
    'addressList': {
        desc: 'get bitcoin address list',
        error: 'get bitcoin address list error'
    },
    'btcBalance': {
        desc: 'get bitcoin address balance',
        error: 'get bitcoin address balance error'
    },
    'wbtcBalance': {
        desc: 'get wbtc address balance',
        error: 'listWanAddr error'
    },
    'wanBalance': {
        desc: 'list wanchain address balances',
        error: 'listWanAddr error'
    },
    'listStoreman': {
        desc: 'get all storeman',
        error: 'get storemanGroup list error'
    },
    'normalTransaction': {
        desc: 'bitcoin normal transaction',
        error: 'bitcoin normal transaction error'
    },
    'listTransactions': {
        desc: 'list all transasctions',
        error: 'get bitcoin transaction list error'
    },
    'lockBtc': {
        desc: 'crosschain lockBtc'
    },
    'redeemBtc': {
        desc: 'crosschain redeemBtc'
    },
    'revokeBtc': {
        desc: 'crosschain revokeBtc'
    },
    'lockWbtc': {
        desc: 'crosschain lockWbtc'
    },
    'redeemWbtc': {
        desc: 'crosschain redeemWbtc'
    },
    'revokeWbtc': {
        desc: 'crosschain revokeWbtc'
    },

};
