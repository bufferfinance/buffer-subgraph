import { Create, Expire, Exercise, BufferBinaryEuropeanATMOptionsV2 } from '../generated/BufferBinaryEuropeanATMOptionsV2/BufferBinaryEuropeanATMOptionsV2'
import { InitiateTrade, CancelTrade, Router, OpenTrade } from '../generated/Router/Router'

import { UserOptionData } from '../generated/schema'

export function handleCreate(event: Create): void {
  let optionID = event.params.id
  let contract = BufferBinaryEuropeanATMOptionsV2.bind(event.address)
  let optionData = contract.options(optionID)
  let txn = `${event.params.id}${event.address}${optionData.value0}`
  let userOptionData = new UserOptionData(txn)
  userOptionData.optionID = event.params.id
  userOptionData.userAddress = event.params.account
  userOptionData.settlementFee = event.params.settlementFee
  userOptionData.totalFee = event.params.totalFee
  userOptionData.state = optionData.value0
  userOptionData.strike = optionData.value1
  userOptionData.amount = optionData.value2
  userOptionData.expirationTime = optionData.value5
  userOptionData.isAbove = optionData.value6 ? true : false
  userOptionData.creationTime = optionData.value8
  userOptionData.contractAddress = event.address
  userOptionData.depositToken = "USDC"
  userOptionData.save()
}


export function handleExercise(event: Exercise): void {
  let txn = `${event.params.id}${event.address}${1}`

  let userOptionData = UserOptionData.load(txn)
  if (userOptionData != null) {
    userOptionData.state = 2
    userOptionData.payout = event.params.profit
    userOptionData.expirationPrice = event.params.priceAtExpiration
    userOptionData.save()  
  }
}


export function handleExpire(event: Expire): void {
  let txn = `${event.params.id}${event.address}${1}`
  let userOptionData = UserOptionData.load(txn)
  if (userOptionData != null) {
    userOptionData.state = 3
    userOptionData.expirationPrice = event.params.priceAtExpiration
    userOptionData.save()  
  }
}

export function handleInitiateTrade(event: InitiateTrade): void {
  let queueID = event.params.queueId
  let state = 4
  let txn = `${queueID}${event.address}${state}`
  let userOptionData = new UserOptionData(txn)
  userOptionData.queueID = queueID
  userOptionData.userAddress = event.params.account
  userOptionData.state = state

  let contract = Router.bind(event.address)
  let queuedTradeData = contract.queuedTrades(queueID)
  userOptionData.strike = queuedTradeData.value7
  userOptionData.totalFee = queuedTradeData.value3
  userOptionData.contractAddress = queuedTradeData.value6
  userOptionData.slippage = queuedTradeData.value8
  userOptionData.isAbove = queuedTradeData.value5 ? true : false
  userOptionData.depositToken = "USDC"
  userOptionData.save()
}
  
//TODO : TEST
export function handleCancelTrade (event: CancelTrade): void {
  let queueID = event.params.queueId
  let txn = `${queueID}${event.address}${4}`
  let userOptionData = UserOptionData.load(txn)
  if (userOptionData != null) {
    userOptionData.state = 5
    userOptionData.save()
  }
}

//TODO : TEST
export function handleOpenTrade(event: OpenTrade): void {
  let queueID = event.params.queueId
  let txn = `${queueID}${event.address}${4}`  
  let userOptionData = UserOptionData.load(txn)
  if (userOptionData != null) {
    userOptionData.state = 6
    userOptionData.save()  
  }
}

