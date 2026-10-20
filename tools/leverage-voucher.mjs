import 'dotenv/config'
import { createPublicClient, http, parseAbi, defineChain, parseEther } from 'viem'
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains'
const local = defineChain({ ...hidekiTestnet, rpcUrls: { default: { http: ['http://127.0.0.1:8545'], webSocket: ['ws://127.0.0.1:8545'] } } })
const pc = createPublicClient({ chain: local, transport: http('http://127.0.0.1:8545') })
const A='0x8749f3a55df81ccfdabdb0c8f2de00c7b769c95f', bank='0x478769E1177C0773c43A593DCCc4Ad15F15F1394', btc='0x4181dd08E73BbCdd1Ba3E615A18f6abD941b94C0'
const abi=parseAbi(['function setMaxLeverage(address,uint16)','function getMaxLeverage(address,address) view returns (uint16)','function getCreditFloor(address) view returns (uint256)'])
console.log('before',await pc.readContract({address:bank,abi,functionName:'getMaxLeverage',args:[A,btc]}),'floor',await pc.readContract({address:bank,abi,functionName:'getCreditFloor',args:[A]}))
await pc.request({method:'anvil_setBalance',params:[A,'0x'+parseEther('10').toString(16)]})
await pc.request({method:'anvil_impersonateAccount',params:[A]})
try{
 const h=await pc.request({method:'eth_sendTransaction',params:[{from:A,to:bank,data:'0x374fe92d'+btc.slice(2).padStart(64,'0')+'0000000000000000000000000000000000000000000000000000000000000005',gas:'0x989680'}]})
 const r=await pc.waitForTransactionReceipt({hash:h});console.log('tx',r.status)
}catch(e){console.log('tx ERR',e.shortMessage||e.message,e.data)}
await pc.request({method:'anvil_stopImpersonatingAccount',params:[A]})
console.log('after',await pc.readContract({address:bank,abi,functionName:'getMaxLeverage',args:[A,btc]}),'floor',await pc.readContract({address:bank,abi,functionName:'getCreditFloor',args:[A]}))
process.exit(0)
