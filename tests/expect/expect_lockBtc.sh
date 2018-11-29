#!/usr/bin/expect

set test_case "expect_lockBtc "
# no timeout -1
set timeout -1
set action "lockBtc"

set testLabel [lindex $argv 0]
set test_case "${test_case}${testLabel} "
set testnet [lindex $argv 1]
set lockBtcStroemanIndex [lindex $argv 2]
set lockBtcWanAddressIndex [lindex $argv 3]
set lockBtcAmount [lindex $argv 4]
set lockBtcWanAddressPasswd [lindex $argv 5]
set BtcPasswd [lindex $argv 6]

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
	"get bitcoin transaction list error:  no transaction to redeem." {
		puts $fd "${test_case} successful, No transaction for redeem found"
		exit
	}

	"Input index or hashX:" {
		send "${hashX}\r"
	}
}

expect 	{
	"Input the index of wanchain address: " {
			send "${lockBtcWanAddressIndex}\n"
		}
}

expect 	{
	"Input transaction amount(>=0.002): " {
			send "${lockBtcAmount}\n"
		}
}

expect 	{
	"Input the wanchain address Password: " {
			send "${lockBtcWanAddressPasswd}\n"
		}
}

expect 	{
	"Input the BTC wallet Password(minimum 8 characters): " {
			send "${BtcPasswd}\n"
		}
}

expect {
	"sendWanNotice txHash: " {
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

