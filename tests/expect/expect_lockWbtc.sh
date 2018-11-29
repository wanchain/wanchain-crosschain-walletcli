#!/usr/bin/expect

set test_case "expect_lockWbtc "
# no timeout -1
set timeout -1
set action "lockWbtc"

set testLabel [lindex $argv 0]
set test_case "${test_case}${testLabel} "
set testnet [lindex $argv 1]
set lockBtcStroemanIndex [lindex $argv 2]
set lockBtcWanAddressIndex [lindex $argv 3]
set lockWbtcBtcAddressIndex [lindex $argv 4]
set lockBtcAmount [lindex $argv 5]
set lockBtcWanAddressPasswd [lindex $argv 6]

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
	"Input the index or StoremanGroup: " {
		send "${lockBtcStroemanIndex}\n"
	}
}

expect 	{
	"Input the index of wanchain address: " {
			send "${lockBtcWanAddressIndex}\n"
		}
}

expect 	{
	"Input the index or bitcoin address: " {
			send "${lockWbtcBtcAddressIndex}\n"
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

expect {
	"wdHash: " {
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

