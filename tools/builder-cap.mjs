// Reproduces feedback/013: Hideki perps builder cap is 10,000, not 0.
import 'dotenv/config'
import { createPublicClient, http, parseAbi } from 'viem'
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains'
const pc = createPublicClient({ chain: hidekiTestnet, transport: http('https://api.hideki2.infra.testnet.somnia.network') })
const abi = parseAbi(['function getMaxBuilderFeeBpsTimes1k() view returns (uint256)'])
for (const [sym, pool] of [['BTC','0x4181dd08E73BbCdd1Ba3E615A18f6abD941b94C0'], ['ETH','0xD6Cb1DD58580B84D76068aC21594219ce03aeddf']]) {
  console.log(sym, (await pc.readContract({ address: pool, abi, functionName: 'getMaxBuilderFeeBpsTimes1k' })).toString())
}
