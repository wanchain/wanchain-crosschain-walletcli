#!/usr/bin/expect

set test_case "expect_revokeBtc "
# no timeout -1
set timeout -1
set action "revokeBtc"

set testLabel [lindex $argv 0]
set test_case "${test_case}${testLabel} "
set testnet [lindex $argv 1]
set revokeBtcIndex [lindex $argv 2]
set BtcPasswd [lindex $argv 3]

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
	"get bitcoin transaction list error: no transaction to revoke." {
		puts $fd "${test_case} successful, No transaction for redeem found"
		exit
	}

	"Input the index of transaction you want to revoke: " {
		send "${revokeBtcIndex}\r"
	}
}

expect 	{
	"Input the BTC wallet Password(minimum 8 characters): " {
			send "${BtcPasswd}\n"
		}
}

expect {
	"btc password is wrong." {
		puts $fd "${test_case} failed, Wrong password"
		exit
	}
	"revokeBtc error: " {
		puts $fd "${test_case} failed, revokeBtc error"
		exit
	}
	"revokeBtc:" {
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

