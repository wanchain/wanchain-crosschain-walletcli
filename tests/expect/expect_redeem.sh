#!/usr/bin/expect

set test_case "expect_redeem "
# no timeout -1
set timeout -1 
set action "redeem"

set testLabel [lindex $argv 0]
set test_case "${test_case}${testLabel} "
set testnet [lindex $argv 1]
set passwd [lindex $argv 2]
set hashX [lindex $argv 3]

set gasLimit "470000"
set direction ""

set fd [open ./test_result a]

if {$testnet eq "true"} {
	set test "--testnet"
} else {
	set test ""
}

spawn node commands/cli.js $test

log_file test_log

expect "wallet-cli$ "

send "${action}\n"

expect {
	"Input index or hashX:" {
		send "${hashX}\r"
	}
	"No transaction for redeem found. Please try later." {
		puts $fd "${test_case} successful, No transaction for redeem found"
		exit
	}
}

expect	{
	"Input gas price (Recommend 10Gwei-60Gwei):" {
			set gasPrice "10"
			set direction "outBound"
			send "${gasPrice}\n"
		}
	"Input gas price (Recommend 180Gwin-600Gwin):" {
			set gasPrice "180"
			set direction "inBound"
			send "${gasPrice}\n"
		}
	"Please input again." {
		puts $fd "${test_case} failed, Input index or hashX: ${hashX}"
		send "exit\n"
		exit
	}
}

expect 	{
	"Input gas limit " {
			send "${gasLimit}\n"
		}
	"Please input again." {
		puts $fd "${test_case}${direction} failed, Input gas price: ${gasPrice}"
		puts $fd "$expect_out(buffer)"
		send "exit\n"
		exit
	}
}

expect	{
	"Input the password:" {
			send "${passwd}\n"
		}
	"Please input again." {
		puts $fd "${test_case}${direction} failed, Input gas limit: ${gasLimit}"
		puts $fd "$expect_out(buffer)"
		send "exit\n"
		exit
	}
}
expect {
	"Wrong password" {
		puts $fd "${test_case}${direction} failed, Wrong password"
		exit
	}
	"txHash:  0x" {
		puts $fd "${test_case}${direction} successful"
	}
	"wallet-cli$ " {
		set out $expect_out(buffer)
		puts $fd "${test_case}${direction} failed\n, $out"
		send "exit\n"
	}
}

expect {
	"wallet-cli$ " {
		set out $expect_out(buffer)
		puts $fd "txHash: 0x$out"
		send "exit\n"
	}
	eof {
		exit
	}
}
	
expect eof
close $fd
exit