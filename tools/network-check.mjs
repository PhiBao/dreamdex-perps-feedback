// Reproduces feedback/014: the linked tx is Shannon, not Hideki.
import 'dotenv/config'
import { createPublicClient, http, parseAbi } from 'viem'
const shannon = createPublicClient({ transport: http('https://api.infra.testnet.somnia.network') })
const hideki = createPublicClient({ transport: http('https://api.hideki2.infra.testnet.somnia.network') })
const tx = '0xc00df0462aedc0538447747e54e981536782ad7944e0c6776373a124022f017d'
const token = '0x70a86d8842fb63c4ad2b7cdddf530ebf1bb25d8e'
const recipient = '0x21ad5f5569069b5c1defa50988849c421533f97b'
const erc20 = parseAbi(['function symbol() view returns (string)','function decimals() view returns (uint8)','function balanceOf(address) view returns (uint256)'])
const shTx = await shannon.getTransaction({ hash: tx }).catch(() => null)
const hiTx = await hideki.getTransaction({ hash: tx }).catch(() => null)
const [symbol, decimals, bal, shStt, hiStt, shCode, hiCode] = await Promise.all([
  shannon.readContract({ address: token, abi: erc20, functionName: 'symbol' }).catch(() => null),
  shannon.readContract({ address: token, abi: erc20, functionName: 'decimals' }).catch(() => null),
  shannon.readContract({ address: token, abi: erc20, functionName: 'balanceOf', args: [recipient] }).catch(() => null),
  shannon.getBalance({ address: recipient }).catch(() => null),
  hideki.getBalance({ address: recipient }).catch(() => null),
  shannon.getCode({ address: token }).catch(() => null),
  hideki.getCode({ address: token }).catch(() => null),
])
console.log(JSON.stringify({
  tx,
  shannon: {
    found: Boolean(shTx), chainId: shTx?.chainId, blockNumber: shTx?.blockNumber?.toString(),
    to: shTx?.to, value: shTx?.value?.toString(), input: shTx?.input?.slice(0, 74),
    token: { symbol, decimals: decimals?.toString(), codeLength: shCode?.length },
    recipient: { tUSDC: bal?.toString(), stt: shStt?.toString() },
  },
  hideki: {
    found: Boolean(hiTx),
    tokenCodeLength: hiCode?.length,
    recipient: { stt: hiStt?.toString() },
  },
}, null, 2))
