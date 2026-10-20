// Reproduces feedback/005: docs say no backstop bidders; the engine has one.
import 'dotenv/config'
import { createPublicClient, http, parseAbi } from 'viem'
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains'
const pc = createPublicClient({ chain: hidekiTestnet, transport: http('https://api.hideki2.infra.testnet.somnia.network') })
const engine = '0xA66d3C24Ad4a389d863846905D8173e1017e9F4D'
const abi = parseAbi([
  'function getBidderCount() view returns (uint256)',
  'function getBidders() view returns (address[])',
  'function getLiquidationPenaltyBps() view returns (uint256)',
])
const [count, bidders, penalty, block] = await Promise.all([
  pc.readContract({ address: engine, abi, functionName: 'getBidderCount' }),
  pc.readContract({ address: engine, abi, functionName: 'getBidders' }),
  pc.readContract({ address: engine, abi, functionName: 'getLiquidationPenaltyBps' }),
  pc.getBlock(),
])
console.log(JSON.stringify({ block: block.number.toString(), bidderCount: count.toString(), bidders, liquidationPenaltyBps: penalty.toString() }, null, 2))
