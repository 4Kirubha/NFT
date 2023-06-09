const keccak256 = require("keccak256");
const{MerkleTree} = require("merkletreejs");

    const whiteListedAddresses = [
      "0x2Ea5DA7Dd4c252D1B63c106477d93f9878186f4F",
      "0x8620EAad2B737F2cCD63C7AD626DC30D78Bb7cBf",
      "0xc2858E82b388e4E5e8644Ca89D3f1b03D9047181",
    ];

    const leaves = whiteListedAddresses.map(addr =>  keccak256(addr));
    const merkleTree = new MerkleTree (leaves,keccak256,{ sortPairs:true });
    const root = merkleTree.getHexRoot();
    console.log(root);