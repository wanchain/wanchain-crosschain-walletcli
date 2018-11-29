#!/usr/bin/expect

set test_case "expect_listStoremanGroups "
# no timeout -1
set timeout -1
set action "listStoremanGroups"

set testLabel [lindex $argv 0]
set test_case "${test_case}${testLabel} "
set testnet [lindex $argv 1]
set sourceChain [lindex $argv 2]
set tokenSymbol [lindex $argv 3]
set account [lindex $argv 4]

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
	
	"get storemanGroup list error" {
		puts $fd "${test_case} failed, get storemanGroup list error"
		exit
	}
	"wanAddress " {
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

