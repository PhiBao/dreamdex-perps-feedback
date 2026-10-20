// Reproduces feedback/004. The docs table values are embedded so this script
// runs from a clean checkout without the scraped docs folder.
import 'dotenv/config'
import { SomniaMarkets, SOMNIA_HIDEKI_TESTNET_ADDRESSES } from '@somnia-chain/markets-sdk'
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains'
import { createPublicClient, http, parseAbi } from 'viem'

const docs = {
  BTC: { oi: 246.81545, paper: 'Yes' },
  ETH: { oi: 3995.6125, paper: 'Yes' },
  HYPE: { oi: 23812.72, paper: 'Yes' },
  SOL: { oi: 47654.44, paper: 'Yes' },
  XRP: { oi: 344632, paper: 'Yes' },
  ADA: { oi: 2254678, paper: 'Yes' },
  AVAX: { oi: 66672.2, paper: 'Yes' },
  BNB: { oi: 693.975, paper: 'Yes' },
  DOGE: { oi: 5613590, paper: 'Yes' },
  LINK: { oi: 42643.6, paper: 'Yes' },
  NEAR: { oi: 250410, paper: 'Yes' },
  SUI: { oi: 635009, paper: 'Yes' },
  XLM: { oi: 2677780, paper: 'Yes' },
  '1000PEPE': { oi: 130285600, paper: 'No' },
  LIT: { oi: 138896.6, paper: 'No' },
  PUMP: { oi: 87993700, paper: 'No' },
  TAO: { oi: 2185.491, paper: 'Yes' },
  VVV: { oi: 21786.14, paper: 'No' },
  WLD: { oi: 1264000, paper: 'Yes' },
  ZEC: { oi: 420, paper: 'No' },
  ZRO: { oi: 250599.5, paper: 'No' },
}

const pc = createPublicClient({ chain: hidekiTestnet, transport: http('https://api.hideki2.infra.testnet.somnia.network') })
const app = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: 'https://hideki-dev.smk.somnia.host/v1/graphql', addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES })
const c = app.client
const abi = parseAbi(['function getPerpPoolParameters() view returns ((uint256,uint256,uint256,uint256,uint256,uint256,int256,uint256))'])
const block = await pc.getBlockNumber()
console.log('block', block.toString())
console.log('| Market | docs OI cap | on-chain maxPosition | maxPosition / docs OI | Paper (docs) |')
console.log('|---|---:|---:|---:|---|')
let tenth = 0, twenty = 0, other = 0
for (const m of await c.listPerpMarkets()) {
  const pp = await pc.readContract({ address: m.poolAddress, abi, functionName: 'getPerpPoolParameters', blockNumber: block })
  const d = docs[m.baseSymbol]
  if (!d) continue
  const human = Number(pp[4]) / 10 ** m.baseDecimals
  const ratio = human / d.oi * 100
  if (Math.abs(ratio - 10) < 0.2) tenth++
  else if (Math.abs(ratio - 20) < 0.3) twenty++
  else other++
  console.log(`| ${m.baseSymbol} | ${d.oi} | ${human.toLocaleString('en-US', { maximumFractionDigits: 8 })} | ${ratio.toFixed(2)}% | ${d.paper} |`)
}
console.log('counts', { tenth, twenty, other })
await app.close()
