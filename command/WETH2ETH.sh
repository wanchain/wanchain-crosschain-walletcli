#!/bin/sh
node LockWANTrans.js --from 1 --storemanGroup 1 --cross 0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8 --amount 0.00008 --gasPrice 200 --gas 1000000 --password wanglu
node RefundETHTrans.js --lockTxHash 1 --gasPrice 200 --gas 1000000 --password wanglu
