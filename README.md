# Krypteo Wallet SDK

Krypteo SDK нь [Bitski JS](https://github.com/BitskiCo/bitski-js) санг [krypteo.mn](https://krypteo.mn)-д нэвтрэх боломжтой болгон өөрчилсөн сан юм.
Уг санг ашигласнаар Metamask зэрэгтэй ижил web3js-ийн provider байдлаар ашиглагддаг төвлөрсөн хэтэвч Krypteo Wallet-ийг өөрийн вэб дээр холбох боломжтой болно.

Суулгах заавар:
```angular2html
npm install --save krypteo
```

Ашиглах заавар:

```angular2html
import { Bitski } from 'krypteo';
import Web3 from 'web3';

const bitski = new Bitski('CLIENT-ID', 'https://myapp.com/callback.html');

const provider = bitski.getProvider();
const web3 = new Web3(provider);

// public calls are always available
const network = await web3.eth.getBlockNumber();

// connect via oauth to use the wallet (call this from a click handler)
await bitski.signIn();

// now you can get accounts
const accounts = await web3.eth.getAccounts();

// and submit transactions for the user to approve
const txn = await web3.eth.sendTransaction({
  from: accounts[0],
  to: '...',
  value: web3.utils.toWei('1')
});
```
