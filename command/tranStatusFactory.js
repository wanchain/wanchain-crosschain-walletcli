"use strict";
/*
color support
=================
blue
red
green
cyan
grey
=================
 */
module.exports = {
    sentHashPending:            ["Locking transaction:      step [1/5]",    "red"   ],
    sentHashConfirming:         ["Locking transaction:      step [2/5]",    "red"   ],
    waitingCross:               ["Locking transaction:      step [3/5]",    "red"   ],
    waitingCrossConfirming:     ["Locking transaction:      step [4/5]",    "red"   ],
    waitingX:                   ["Lock transaction:         success",       "green" ],
    waitingRevoke:              ["Waiting cancel transaction",              "red"   ],
    sentRevokePending:          ["Cancelling transaction:   step [1/3]",    "red"   ],
    sentRevokeConfirming:       ["Cancelling transaction:   step [2/3]",    "red"   ],
    revokeFinished:             ["Cancel transaction:       cancelled",      "green" ],
    sentXPending:               ["Confirming transaction:   step [1/3]",    "red"   ],
    sentXConfirming:            ["Confirming transaction:   step [2/3]",    "red"   ],
    refundFinished:             ["Confirm transaction:      success",       "green" ]
}
