// Reproduces feedback/001 at a fixed historical block.
// SDK capture (markets-sdk 0.32.1):
//   account 0x420691db9d2b5a79210fda48c177471386b6dfd1, SOL-PERP, isBid=true
//   price=93870000000000000000, maxQuantity=7130000000000,
//   limitedBy="maxPositionSize", asOfBlock=28492725
//   positionSize=-2364560000000, maxPositionSize=4765440000000, lotSize=10000000
import 'dotenv/config'
import { createPublicClient, http, parseAbi, encodeFunctionData } from 'viem'
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains'

const pc = createPublicClient({ chain: hidekiTestnet, transport: http('https://api.hideki2.infra.testnet.somnia.network') })
const pool = '0xb483ec1fb34996638677c20ab087b16f1896fa53'
const account = '0x420691db9d2b5a79210fda48c177471386b6dfd1'
const block = 28492725n
const price = 93870000000000000000n
const lot = 10000000n
const sdkMax = 7130000000000n
const abi = parseAbi([
  'function placeOrder(bool,uint64,uint256,uint256,uint64,uint8,uint8,address,uint96) returns (bool,uint128)',
  'function getPerpPoolParameters() view returns ((uint256,uint256,uint256,uint256,uint256,uint256,int256,uint256))',
  'function getReducingCapacity(address) view returns ((int128,uint256,uint256,uint256,uint256))',
])
const [pp, rc] = await Promise.all([
  pc.readContract({ address: pool, abi, functionName: 'getPerpPoolParameters', blockNumber: block }),
  pc.readContract({ address: pool, abi, functionName: 'getReducingCapacity', args: [account], blockNumber: block }),
])
const pendingBid = rc[1]
const boundary = sdkMax - pendingBid
console.log({
  block: block.toString(),
  positionSize: rc[0].toString(),
  pendingBid: pendingBid.toString(),
  maxPositionSize: pp[4].toString(),
  sdkMax: sdkMax.toString(),
  sdkMaxMinusPendingBid: boundary.toString(),
})
for (const [tag, q] of [['sdkMax', sdkMax], ['sdkMax-pendingBid', boundary], ['sdkMax-pendingBid+lot', boundary + lot]]) {
  const data = encodeFunctionData({ abi, functionName: 'placeOrder', args: [true, 0n, price, q, 1792600000000000000n, 0, 0, '0x0000000000000000000000000000000000000000', 0n] })
  try {
    const r = await pc.request({ method: 'eth_call', params: [{ from: account, to: pool, data, gas: '0x989680' }, '0x' + block.toString(16)] })
    console.log(tag, q.toString(), 'OK', r.slice(0, 66))
  } catch (e) {
    console.log(tag, q.toString(), 'REVERT', e.data ?? e.cause?.data)
  }
}
