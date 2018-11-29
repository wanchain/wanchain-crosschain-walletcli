#!/usr/bin/expect

set test_case "expect_sendBtcToAddress "
# no timeout -1
set timeout -1
set action "sendBtcToAddress"

set testLabel [lindex $argv 0]
set test_case "${test_case}${testLabel} "
set testnet [lindex $argv 1]
set sendBtcAmount [lindex $argv 2]
set sendBtcTo [lindex $argv 3]
set BtcPasswd [lindex $argv 4]

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
	"Input transaction amount: " {
		send "${sendBtcAmount}\n"
	}
}

expect 	{
	"Input bitcoin recipient address: " {
			send "${sendBtcTo}\n"
		}
}

expect 	{
	"Input the BTC wallet Password(minimum 8 characters): " {
			send "${BtcPasswd}\n"
		}
}

expect {
	
	"get bitcoin address balance error" {
		puts $fd "get bitcoin address balance error: failed"
	}
	"no bitcoin keyPairs!" {
		put $fd "no bitcoin keyPairs!"
	}
	"Not enough balance " {
		puts $fd "Not enough balance "
	}
	"bitcoin normal transaction error:" {
		puts $fd "bitcoin normal transaction error: failed"
	}
	"hash: " {
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

