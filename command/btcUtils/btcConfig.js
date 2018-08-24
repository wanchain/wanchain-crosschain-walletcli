module.exports = {
    'passwd': {
        type: 'password',
        name: 'password',
        message: 'Input the BTC wallet Password(minimum 8 characters: '
    },
    'wanPasswd': {
        type: 'password',
        name: 'password',
        message: 'wan address Password: '
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
        message: 'wanAddress: '
    },
    'btcAddress':  {
        type: 'input',
        name: 'btcAddress',
        message: 'btcAddress: '
    },
    'to': {
        type: 'input',
        name: 'to',
        message: 'Input bitcoin recipient address: '
    },
    'listStoremanGroup': {
        type: 'input',
        name: 'storeman',
        message: 'list storemanGroups: '
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
    },
    'listBtcAddress': {
        desc: 'list bitcoin addresses list.'
    },
    'getBtcBalance': {
        desc: 'get bitcoin address total balance'
    },
    'listWbtcBalance': {
        desc: 'list wbtc balances'
    },
    'listWanBalance': {
        desc: 'list wanchain address balances'
    },
    'listStoremanGroups': {
        desc: 'list storemanGroups'
    },
    'sendBtcToAddress': {
        desc: 'bitcoin normal transaction. send bitcoin to an address.'
    },
    'listTransactions': {
        desc: 'list all transasctions'
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
