const{ethers} = require("hardhat");
const{METADATA_URL,root} = require("../values/index");

async function main(){
  const metadataUrl = METADATA_URL;
  const ROOT = root;
  const kryptoContract = await ethers.getContractFactory("KryptoCivilian");
  const deployedKryptoContract = await kryptoContract.deploy(metadataUrl,ROOT);
  await deployedKryptoContract.deployed();

  console.log("Krypto Civilian NFT",deployedKryptoContract.address);

}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
