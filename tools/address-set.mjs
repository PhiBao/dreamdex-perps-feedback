// Reproduces feedback/009: the bundled Hideki address set lacks the operator registry.
import { SOMNIA_HIDEKI_TESTNET_ADDRESSES } from '@somnia-chain/markets-sdk'
console.log('operatorPermissionsRegistry:', SOMNIA_HIDEKI_TESTNET_ADDRESSES.operatorPermissionsRegistry)
console.log('keys:', Object.keys(SOMNIA_HIDEKI_TESTNET_ADDRESSES).sort().join(', '))
console.log('docs address: 0x6B2FbfeD328FF5F20C0BE7D3C3437613aFFE8D3a')
