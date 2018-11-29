#!/usr/bin/expect

set test_case "expect_lock "
# no timeout -1
set timeout -1
set action "lock"

set testLabel [lindex $argv 0]
set test_case "${test_case}${testLabel} "
set testnet [lindex $argv 1]
set passwd [lindex $argv 2]
set sourceChain [lindex $argv 3]
set storeman [lindex $argv 4]
set tokenAddr [lindex $argv 5]
set from [lindex $argv 6]
set to [lindex $argv 7]
set amount [lindex $argv 8]

if {$sourceChain eq "WAN"} {
	# set gasPrice "180"
	set direction "outBound"
} else {
	# set gasPrice "10"
	set direction "inBound"
}
set destChain "ETH"
set gasLimit "470000"

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
	"Source Chain" {
		send "${sourceChain}\n"
		}
}

if {$sourceChain eq "WAN" || $sourceChain eq "2"} {
	expect {
		"Destination Chain" {
			send "${destChain}\r";
		}
		"Please input again." {
			puts $fd "${test_case}${direction} failed, Source Chain: ${sourceChain}"
			send "exit\n"
			exit
		}
	}
	expect {
		"Token Symbol" {
			send "${tokenAddr}\r"
			}
		"Please input again." {
			puts $fd "${test_case}${direction} failed, Destination Chain: ${destChain}"
			send "exit\n"
			exit
		}
	}
} else {
	expect {
		"Token Symbol" {
			send "${tokenAddr}\r"
			}
		"Please input again." {
			puts $fd "${test_case}${direction} failed, Source Chain: ${sourceChain}"
			send "exit\n"
			exit
		}
	}
}
	
expect	{
	"Sender Account" {
			send "${from}\n"
		}
	"Please input again." {
		puts $fd "${test_case}${direction} failed, Token Address: ${tokenAddr}"
		send "exit\n"
		exit
	}
}
expect	{
	"Storeman Group Address" {
			send "${storeman}\n"
		}
	"Please input again." {
		puts $fd "${test_case}${direction} failed, Sender Account: ${from}"
		send "exit\n"
		exit
	}
}
expect	{
	"Receiver Account" {
			send "${to}\n"
		}
	"Please input again." {
		puts $fd "${test_case}${direction} failed, Storeman Group Address: ${storeman}"
		send "exit\n"
		exit
	}
}
expect	{
	"Input transaction amount:" {
			send "${amount}\n"
		}
	"Please input again." {
		puts $fd "${test_case}${direction} failed, Receiver Account: ${to}"
		puts $fd "$expect_out(buffer)"
		send "exit\n"
		exit
	}
}
expect 	{
	"Input gas price (Recommend 10Gwei-60Gwei):" {
			set gasPrice "10"
			send "${gasPrice}\n"
		}
	"Input gas price (Recommend 180Gwin-600Gwin):" {
			set gasPrice "180"
			send "${gasPrice}\n"
		}
	"Balance is not enough." {
		puts $fd "${test_case}${direction} failed, Balance is not enough. Input transaction amount: ${amount}"
		send "exit\n"
		exit
	}
	"Please input again." {
		puts $fd "${test_case}${direction} failed, Input transaction amount: ${amount}"
		puts $fd "$expect_out(buffer)"
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
	"txHash: 0x" {
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