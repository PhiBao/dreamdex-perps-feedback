// Reproduces feedback/003: the paper-USDso allowlist is open on all 21 markets.
import 'dotenv/config'
import { SomniaMarkets, SOMNIA_HIDEKI_TESTNET_ADDRESSES, contractErrorsAbi } from '@somnia-chain/markets-sdk'
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains'
import { createPublicClient, http, parseAbi, decodeErrorResult } from 'viem'

const pc = createPublicClient({ chain: hidekiTestnet, transport: http('https://api.hideki2.infra.testnet.somnia.network') })
const app = new SomniaMarkets({
  chain: hidekiTestnet,
  indexerUrl: 'https://hideki-dev.smk.somnia.host/v1/graphql',
  addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES,
})
const c = app.client
const A = '0x8749f3a55df81ccfdabdb0c8f2de00c7b769c95f'
const bank = (await c.listPerpMarkets())[0].marginBank
const bankAbi = parseAbi(['function isVoucherMarketAllowed(address) view returns (bool)'])
const abi = parseAbi([
  'function placeOrder(bool,uint64,uint256,uint256,uint64,uint8,uint8,address,uint96) returns (bool,uint128)',
  'function getOrderBookParameters() view returns ((uint256,uint256,uint256))',
])
const markets = await c.listPerpMarkets()
const allowed = {}
for (const m of markets) {
  allowed[m.baseSymbol] = await pc.readContract({ address: bank, abi: bankAbi, functionName: 'isVoucherMarketAllowed', args: [m.poolAddress] })
}
console.log('isVoucherMarketAllowed:', allowed)
console.log('all allowed:', Object.values(allowed).every(Boolean), 'count:', Object.keys(allowed).length)

const docsNo = ['1000PEPE', 'LIT', 'PUMP', 'VVV', 'ZEC', 'ZRO']
for (const sym of docsNo) {
  const m = markets.find((x) => x.baseSymbol === sym)
  const st = await c.getPerpState(m.poolAddress)
  const ob = await pc.readContract({ address: m.poolAddress, abi, functionName: 'getOrderBookParameters' })
  const price = (st.markPrice * 5n / 10n / ob[0]) * ob[0]
  const exp = (BigInt(Math.floor(Date.now() / 1000)) + 50n * 365n * 24n * 3600n) * 1_000_000_000n
  try {
    await pc.simulateContract({ address: m.poolAddress, abi: [...abi, ...contractErrorsAbi], functionName: 'placeOrder', args: [true, 0n, price, ob[1], exp, 0, 0, '0x0000000000000000000000000000000000000000', 0n], account: A, gas: 10_000_000n })
    console.log(sym, 'SIM OK', 'price', price.toString(), 'qty', ob[1].toString())
  } catch (e) {
    let n = ''
    try { const d = decodeErrorResult({ abi: contractErrorsAbi, data: e.cause?.data ?? e.data }); n = d.errorName } catch {}
    console.log(sym, 'SIM ERR', n, e.cause?.data ?? e.data)
  }
}
await app.close()
