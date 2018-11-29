#!/usr/bin/expect

set test_case "expect_createWanAddress "
# no timeout -1
set timeout -1
set action "createWanAccount"

set testLabel [lindex $argv 0]
set test_case "${test_case}${testLabel} "
set testnet [lindex $argv 1]
set passwd [lindex $argv 2]
set sourceChain [lindex $argv 3]

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

# expect {
# 	"Chain" {
# 		send "${sourceChain}\n"
# 		}
# }

expect {
	# "Input the BTC wallet Password(minimum 8 characters): " {
	# 	puts $fd "${test_case} failed, Chain: ${sourceChain}"
	# 	send "exit\n"
	# 	exit
	# }
	"Input the wanchain address Password: " {
		send "${passwd}\n"
	}
}

expect {
	"create WAN account error." {
		puts $fd "${test_case} failed, create WAN account error."
		exit
	}
	"Your WAN address is: " {
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

