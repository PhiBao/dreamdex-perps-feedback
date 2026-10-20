// Reproduces feedback/008: the SDK exposes no perp …For writes and no perp batch placement.
import { perpPoolWriteAbi, orderBookBatchWriteAbi } from '@somnia-chain/markets-sdk'
const names = (abi) => abi.filter((x) => x.type === 'function').map((x) => x.name)
console.log('perpPoolWriteAbi functions:', names(perpPoolWriteAbi))
console.log('orderBookBatchWriteAbi functions:', names(orderBookBatchWriteAbi))
for (const n of ['placeOrderFor', 'cancelOrderFor', 'reduceOrderFor', 'placeOrdersFor']) {
  console.log(`${n}: ${perpPoolWriteAbi.some((x) => x.type === 'function' && x.name === n) || orderBookBatchWriteAbi.some((x) => x.type === 'function' && x.name === n)}`)
}
