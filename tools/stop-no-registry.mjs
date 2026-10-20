import { SomniaMarkets, SOMNIA_HIDEKI_TESTNET_ADDRESSES } from '@somnia-chain/markets-sdk'
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains'
const app=new SomniaMarkets({chain:hidekiTestnet,indexerUrl:'https://hideki-dev.smk.somnia.host/v1/graphql',addresses:SOMNIA_HIDEKI_TESTNET_ADDRESSES,privateKey:'0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'})
try{await app.trader.buildPlacePerpStopOrder({registry:'0x52E2ccebAeC9332672C247e9A90AA3d61FB615ef',pool:'0x4181dd08E73BbCdd1Ba3E615A18f6abD941b94C0',isBid:false,quantity:13000n,triggerPrice:90000000000000000000000n,triggerOperator:1,stopOrderType:1,somiPayment:150000000000000000n})}catch(e){console.log(e.constructor.name, e.message)}
await app.close()
