import 'dotenv/config'
import { SomniaMarkets, SOMNIA_HIDEKI_TESTNET_ADDRESSES } from '@somnia-chain/markets-sdk'
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains'
import { createPublicClient, http, parseAbi, encodeFunctionData } from 'viem'
const pc=createPublicClient({chain:hidekiTestnet,transport:http('https://api.hideki2.infra.testnet.somnia.network')})
const app=new SomniaMarkets({chain:hidekiTestnet,indexerUrl:'https://hideki-dev.smk.somnia.host/v1/graphql',addresses:SOMNIA_HIDEKI_TESTNET_ADDRESSES})
const c=app.client
const gql=async(q,v)=>(await fetch('https://hideki-dev.smk.somnia.host/v1/graphql',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:q,variables:v})})).json()
const abi=parseAbi(['function placeOrder(bool,uint64,uint256,uint256,uint64,uint8,uint8,address,uint96) returns (bool,uint128)','function getReducingCapacity(address) view returns ((int128,uint256,uint256,uint256,uint256))'])
for(const sym of ['SOL','DOGE','ADA','ZRO']){
 const m=(await c.listPerpMarkets()).find(x=>x.baseSymbol===sym)
 const d=await gql(`query($pool:String!){ PerpPosition(where:{pool:{_eq:$pool}}, order_by:{size:desc}, limit:1){ account } }`,{pool:m.poolAddress})
 const account=d.data.PerpPosition[0].account
 const st=await c.getPerpState(m.poolAddress); const tick=BigInt(m.tickSize); const price=(st.markPrice*9n/10n/tick)*tick
 const size=await c.getMaxPerpOrderSize({pool:m.poolAddress,marginBank:m.marginBank,account,isBid:true,price})
 const b=size.asOfBlock, lot=BigInt(m.lotSize)
 const rc=await pc.readContract({address:m.poolAddress,abi,functionName:'getReducingCapacity',args:[account],blockNumber:b})
 const pending=rc[1], boundary=size.maxQuantity-pending
 console.log('\n',sym,'max',size.maxQuantity.toString(),'pendingBid',pending.toString(),'boundary',boundary.toString(),'lot',lot.toString())
 for(const [tag,q] of [['sdkMax',size.maxQuantity],['sdkMax-pending',boundary],['sdkMax-pending+lot',boundary+lot]]){
  if(q<=0n)continue
  const data=encodeFunctionData({abi,functionName:'placeOrder',args:[true,0n,price,q,1792600000000000000n,0,0,'0x0000000000000000000000000000000000000000',0n]})
  try{const r=await pc.request({method:'eth_call',params:[{from:account,to:m.poolAddress,data,gas:'0x989680'},'0x'+b.toString(16)]});console.log(tag,q.toString(),'OK',r.slice(0,66))}catch(e){console.log(tag,q.toString(),'ERR',e.data??e.cause?.data)}
 }
}
await app.close();process.exit(0)
