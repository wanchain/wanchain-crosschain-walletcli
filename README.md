# wanchain-crosschain-walletcli

Pre-condition
-------------
	1) node version v8.11.3 or higher
	2) npm  version 5.6.0 or higher


How to install cli wallet?
--------------------------
	step1:
		mkdir -p <workspace>
		cd <workspace>
		git clone https://github.com/wanchain/wanchain-crosschain-walletcli.git

	step2:
		cd <workspace>/wanchain-crosschain-walletcli
		git checkout -b wanchain30_release origin/wanchain30_release
		npm install


How to start cli wallet?
------------------------
	step1:
		cd <workspace>/wanchain-js-walletcli

	step2:
		mainnet:
		node cli.js
		
		or
		
		testnet:
		node cli.js --testnet

		wallet-cli$


How to use cli wallet ?
-----------------------
Help

	Commands supported by cli wallet:

    1. help [command...]    Provides help for a given command.
    2. exit                 Exits application.
    3. createBtcAddress     create new bitcoin address
    4. createWanAccount     create new wan address
    5. listBtcAddress       get bitcoin address list
    6. getBtcBalance        get bitcoin address balance
    7. listWbtcBalance      get wbtc address balance
    8. listWanBalance       list wanchain address balances
    9. listStoremanGroups   get all storeman
    10. listTransactions     list all transasctions
    11. sendBtcToAddress     bitcoin normal transaction
    12. lockBtc              crosschain lockBtc
    13. redeemBtc            crosschain redeemBtc
    14. revokeBtc            crosschain revokeBtc
    15. lockWbtc             crosschain lockWbtc
    16. redeemWbtc           crosschain redeemWbtc
    17. revokeWbtc           crosschain revokeWbtc


Examples
--------

Example 1: (Lock on BTC chain, redeem on WAN chain)

    Alice wants to cross BTC coin from BTC chain to WAN chain. Firstly she needs lock BTC on
    the source chain(here the source chain is BTC), and redeem her BTC on the destination chain
    (here the destination chain is WAN).

    step1:
    Select source storeman by input the index.
    wallet-cli$ lockBtc
    ============================================================
    stroeman address
    1: 0x83e5ca256c9ffd0ae019f98e4371e67ef5026d2d
    Input the index or StoremanGroup: 1
    ============================================================

    step2:
    Select the dest wan account index
    ============================================================
    WAN address                                                  balance               wbtc balance
    1: 0x8c2a45ddcd08b546d19f9aefd9f7aaba9d9237ec    9661.815699024684892751                  0.2440179
    2: 0x08eaafb273fe6b85c7849abb4fee3b2404aaf9fa                          6                          0
    3: 0x78e1ae33016e3a3037e209be461dcd4bc082ab4d       4.127392653589797188                          0
    4: 0xb986080afcbf51152f086732cab9b52c277ee7c7                       0.01                          0
    5: 0x844e6137bf3302dfc7068318eaf393325f4000fa                          0                          0
    Input the index: 1

    step3:
    Input transfer amount, and password

    Input transaction amount(>=0.002):0.002
    wait a moment...
    transaction Sign ChainType :  WAN
    sendWanNotice txHash: 0x1869a5451bb2adaaeffc3ae1470ba1888cc3300b8d723f818717a745701ba1f8
   
    step4:
    wallet-cli$ redeemBtc
    No transaction for redeem found. Please try later.

    tips:
        After lock token done, Alice should wait some minutes. She can use listTransaction command to check the status, when status change to waitingX, it mean's ready for redeem.


Example 2: (Check Alice's balance)

    step1: check token amount on source chain.

    wallet-cli$ getBtcBalance
    ============================================================
    wait a moment...
    btcBalance: 0.0098193
    ============================================================
  
    step2: check token amount on destination chain.
    wallet-cli$ listWbtcBalance
             WAN address                                               WBTC balance
    1: 0x8c2a45ddcd08b546d19f9aefd9f7aaba9d9237ec                  0.2440179
    2: 0x08eaafb273fe6b85c7849abb4fee3b2404aaf9fa                          0
    3: 0x78e1ae33016e3a3037e209be461dcd4bc082ab4d                          0
    4: 0xb986080afcbf51152f086732cab9b52c277ee7c7                          0
    5: 0x844e6137bf3302dfc7068318eaf393325f4000fa                          0

Example 3 (list transaction detailed info.)
    wallet-cli$ listTransaction

    wait a moment...
       from                                       to                                    value     status      chain
    1: mkcCxUf5WieTXxPLrXBrbCrUxoWCn1tKyG 0x8c2a45ddcd08b546d19f9aefd9f7aaba9d9237ec 0.0020001 BTC revokeFinished        BTC
       from                                       to                                    value     status      chain
    2: mkcCxUf5WieTXxPLrXBrbCrUxoWCn1tKyG 0x8c2a45ddcd08b546d19f9aefd9f7aaba9d9237ec 0.0020001 BTC revokeFinished        BTC
       from                                       to                                    value     status      chain
    3: mkcCxUf5WieTXxPLrXBrbCrUxoWCn1tKyG 0x8c2a45ddcd08b546d19f9aefd9f7aaba9d9237ec 0.0020001 BTC revokeFinished        BTC
       from                                       to                                    value     status      chain
    4: mkcCxUf5WieTXxPLrXBrbCrUxoWCn1tKyG 0x8c2a45ddcd08b546d19f9aefd9f7aaba9d9237ec 0.0020001 BTC redeemFinished        BTC
   
Example 4 (Revoke on source chain)
    
  After Alice lock token on source chain, she change her mind. Now ,she can revoke this
    transaction on source chain. She can revoke after the revoke time arrived. when the transaction's status changed to waitingRevoke.


    step1:
    wallet-cli$ revokeBtc
    select the transaction which to revoke, and input password.

How to perform a reverse transaction.
-------------------------------------
The reverse transaction which from wbtc to btc use the command of :

    lockWbtc
    redeemWbtc
    revokeWbtc

