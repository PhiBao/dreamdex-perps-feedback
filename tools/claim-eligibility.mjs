// Reproduces feedback/002: the SDK says a clean EOA is eligible, but claim() reverts.
import 'dotenv/config'
import { SomniaMarkets, SOMNIA_HIDEKI_TESTNET_ADDRESSES } from '@somnia-chain/markets-sdk'
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains'
import { createPublicClient, http, parseAbi } from 'viem'

const pc = createPublicClient({ chain: hidekiTestnet, transport: http('https://api.hideki2.infra.testnet.somnia.network') })
const app = new SomniaMarkets({
  chain: hidekiTestnet,
  indexerUrl: 'https://hideki-dev.smk.somnia.host/v1/graphql',
  addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES,
})
const account = '0x0000000000000000000000000000000000000001'
const btc = (await app.client.listPerpMarkets()).find((m) => m.baseSymbol === 'BTC')
const distributor = '0x2ACD9EFdA721450906bfE1bef3edE269636E42C4'
const bank = btc.marginBank
const bankAbi = parseAbi([
  'function getActivePerpPools(address) view returns (address[])',
  'function getMainFundedPrincipal(address) view returns (uint256)',
])
const distAbi = parseAbi([
  'function claim()',
  'function isClaimed(address) view returns (bool)',
  'function budgetRemaining() view returns (uint256)',
  'function getConfig() view returns ((address marginBank,address collateralToken,uint256 grantAmount,uint64 expiryDuration,uint64 campaignStart,uint64 campaignEnd))',
])
const [eligibility, active, mainFunded, claimed, budget, config, block] = await Promise.all([
  app.client.getPerpVoucherEligibility(bank, account),
  pc.readContract({ address: bank, abi: bankAbi, functionName: 'getActivePerpPools', args: [account] }),
  pc.readContract({ address: bank, abi: bankAbi, functionName: 'getMainFundedPrincipal', args: [account] }),
  pc.readContract({ address: distributor, abi: distAbi, functionName: 'isClaimed', args: [account] }),
  pc.readContract({ address: distributor, abi: distAbi, functionName: 'budgetRemaining' }),
  pc.readContract({ address: distributor, abi: distAbi, functionName: 'getConfig' }),
  pc.getBlock(),
])
console.log(JSON.stringify({
  block: block.number.toString(),
  timestamp: block.timestamp.toString(),
  account,
  eligibility: { ...eligibility, grantAmount: eligibility.grantAmount?.toString() },
  activePools: active,
  mainFunded: mainFunded.toString(),
  claimed,
  budgetRemaining: budget.toString(),
  config: Object.fromEntries(Object.entries(config).map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : v])),
}, null, 2))
try {
  await pc.simulateContract({ address: distributor, abi: distAbi, functionName: 'claim', account })
  console.log('claim(): OK')
} catch (e) {
  console.log('claim(): REVERT', e.cause?.data ?? e.data, '|', e.shortMessage)
}
await app.close()
