import 'dotenv/config'
import { createPublicClient, createWalletClient, http, parseAbi, defineChain, parseEther, decodeErrorResult } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains'
import { contractErrorsAbi } from '@somnia-chain/markets-sdk'
const local = defineChain({ ...hidekiTestnet, rpcUrls: { default: { http: ['http://127.0.0.1:8545'], webSocket: ['ws://127.0.0.1:8545'] } } })
const pc=createPublicClient({chain:local,transport:http('http://127.0.0.1:8545')})
const A=privateKeyToAccount('0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a') // anvil 4 (reuse; may have state)
const wallet=createWalletClient({chain:local,transport:http('http://127.0.0.1:8545'),account:A})
const usd='0xed7993A74dAe1e6656B704A424DcD8711aAf4F72', bank='0x478769E1177C0773c43A593DCCc4Ad15F15F1394', pool='0x4181dd08E73BbCdd1Ba3E615A18f6abD941b94C0'
const erc20=parseAbi(['function balanceOf(address) view returns (uint256)','function allowance(address,address) view returns (uint256)','function approve(address,uint256) returns (bool)','function transfer(address,uint256) returns (bool)'])
const bankAbi=parseAbi(['function getAccountState(address) view returns ((int256,uint256,address[]))','function deposit(uint256)'])
const poolAbi=parseAbi(['function placeOrder(bool,uint64,uint256,uint256,uint64,uint8,uint8,address,uint96) returns (bool,uint128)','function tryGetMarkPrice() view returns (bool,uint256)','function getOrderBookParameters() view returns ((uint256,uint256,uint256))'])
await pc.request({method:'anvil_setBalance',params:[A.address,'0x'+parseEther('10').toString(16)]})
await pc.request({method:'anvil_setBalance',params:[bank,'0x'+parseEther('1').toString(16)]})
await pc.request({method:'anvil_impersonateAccount',params:[bank]})
const data='a9059cbb'+A.address.slice(2).padStart(64,'0')+(1000n*10n**18n).toString(16).padStart(64,'0')
const h=await pc.request({method:'eth_sendTransaction',params:[{from:bank,to:usd,data:'0x'+data}]});await pc.waitForTransactionReceipt({hash:h});await pc.request({method:'anvil_stopImpersonatingAccount',params:[bank]})
const appr=await wallet.writeContract({address:usd,abi:erc20,functionName:'approve',args:[bank,1000n*10n**18n]});await pc.waitForTransactionReceipt({hash:appr})
console.log('wallet usd',await pc.readContract({address:usd,abi:erc20,functionName:'balanceOf',args:[A.address]}),'bank state before',await pc.readContract({address:bank,abi:bankAbi,functionName:'getAccountState',args:[A.address]}))
await pc.request({method:'anvil_setTime',params:[1792499887]});await pc.request({method:'anvil_mine',params:[]})
const [ok,mark]=await pc.readContract({address:pool,abi:poolAbi,functionName:'tryGetMarkPrice'})
const ob=await pc.readContract({address:pool,abi:poolAbi,functionName:'getOrderBookParameters'})
const price=(mark*5n/10n/ob[0])*ob[0],exp=(BigInt(Math.floor(Date.now()/1000))+50n*365n*24n*3600n)*1_000_000_000n
try{const r=await pc.simulateContract({address:pool,abi:[...poolAbi,...contractErrorsAbi],functionName:'placeOrder',args:[true,0n,price,ob[1],exp,0,0,'0x0000000000000000000000000000000000000000',0n],account:A,gas:10_000_000n});console.log('place SIM OK',r.result)}catch(e){let n='';try{const d=decodeErrorResult({abi:contractErrorsAbi,data:e.cause?.data??e.data});n=d.errorName+' '+JSON.stringify(d.args)}catch{};console.log('place SIM ERR',n,e.cause?.data??e.data)}
console.log('bank state after',await pc.readContract({address:bank,abi:bankAbi,functionName:'getAccountState',args:[A.address]}))
process.exit(0)
