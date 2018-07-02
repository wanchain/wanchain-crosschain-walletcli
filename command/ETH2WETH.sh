#!/bin/sh
node LockETHTrans.js --from 1 --storemanGroup 1 --cross 0xbd100cf8286136659a7d63a38a154e28dbf3e0fd --amount 0.003 --gasPrice 20 --gas 1000000 --password wanglu
node RefundWANTrans.js --lockTxHash 1 --gasPrice 200 --gas 1000000 --password wanglu
