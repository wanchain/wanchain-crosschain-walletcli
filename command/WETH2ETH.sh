#!/bin/sh
node LockWANTrans.js --from 1 --storemanGroup 1 --cross 0x49bd323ddd6fa686bd0a9acb2b8bf051e6534df2 --amount 1 --gasPrice 20 --gas 3000000 --password 1111111111
node RefundETHTrans.js --lockTxHash 1 --gasPrice 200 --gas 3000000 --password 1111111111