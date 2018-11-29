#!/usr/bin/expect

set test_case "expect_redeemBtc "
# no timeout -1
set timeout -1
set action "redeemBtc"

set testLabel [lindex $argv 0]
set test_case "${test_case}${testLabel} "
set testnet [lindex $argv 1]
set redeemBtcIndex [lindex $argv 2]
set lockBtcWanAddressPasswd [lindex $argv 3]

set fd [open ./test_result a]

if {$testnet eq "true"} {
	set test "--testnet"
} else {
	set test ""
}

spawn node cli.js $test

log_file test_log

expect "wanWallet$ "

send "${action}\n"

expect {
	"get bitcoin transaction list error: no transaction to redeem." {
		puts $fd "${test_case} successful, No transaction for redeem found"
		exit
	}

	"Input the index of transaction you want to redeem: " {
		send "${redeemBtcIndex}\r"
	}
}

expect 	{
	"Input the wanchain address Password: " {
			send "${lockBtcWanAddressPasswd}\n"
		}
}

expect {
	"redeemBtc error: " {
		puts $fd "${test_case} failed, redeemBtc error"
		exit
	}
	"redeemHash: " {
		puts $fd "${test_case} successful"
	}
}

expect {
	"wanWallet$ " {
		send "exit\n"
	}
	eof {
		exit
	}
}

expect eof
close $fd
exit

