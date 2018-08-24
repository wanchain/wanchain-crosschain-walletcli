module.exports = {
    'help': '====== 键入 help 查看所有命令  ====== ',
    'passwd': {
        type: 'password',
        name: 'password',
        message: 'Btc wallet Password: '
    },
    'wanPasswd': {
        type: 'password',
        name: 'password',
        message: 'wan address Password: '
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
        message: 'to: '
    },
    'storeman': {
        type: 'input',
        name: 'storeman',
        message: 'storeman(input index or address): '
    },
    'btcRedeemHash':  {
        type: 'input',
        name: 'redeemHash',
        message: 'redeem hash: '
    },
    'revokeBtcHash':  {
        type: 'input',
        name: 'revokeHash',
        message: 'revoke hash: '
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
        desc: 'get wan address balance',
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
    'listTransaction': {
        desc: 'get all transasction',
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
