import Head from "next/head";
import {providers,Contract,utils} from "ethers";
import Web3Modal from "web3modal";
import React,{ useEffect,useState,useRef} from "react";
import styles from "../styles/Home.module.css"
import { NFT_ADDRESS,ABI } from "../constants";
import{proof} from "../utils/proof";

export default function Home(){
  const[walletConnected,setWalletConnected] = useState(false);
  const[loading,setLoading] = useState(false);
  const[saleStarted,setSaleStarted] = useState(false);
  const[tokenIdsMinted,setTokenIdsMinted] = useState(0);
  const[quantity,setQuantity] = useState(0);
  const[isOwner,setIsOwner] = useState(false);
  const web3ModalRef = useRef();

    const getSignerOrProvider = async(needSigner = false) => {
      const provider = await  web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const {chainId} = await web3Provider.getNetwork();

      if(chainId != 5){
        window.alert("Change the network to Goerli");
        throw new Error("Change network to Goerli");
      }
      if(needSigner){
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    };

    async function startSale(){
      try{
        const signer = await getSignerOrProvider(true);
        const nftContract = new Contract(NFT_ADDRESS,ABI,signer);
        const tx = await nftContract.startSale();
        setLoading(true);
        await tx.wait();
        setLoading(false);
        await checkIfSaleStarted();
      }catch(err){
        console.error(err);
      }
    }

    async function checkIfSaleStarted(){
      try{
        const provider = await getSignerOrProvider();
        const nftContract = new Contract(NFT_ADDRESS,ABI,provider);
        const _saleStarted = await nftContract.saleStarted();
        if(!_saleStarted){
          await getOwner();
        }
        setSaleStarted(_saleStarted);
        return _saleStarted;
      }catch(err){
        console.error(err);
        return false;
      }
    }

    async function mint(){
      try{
        const signer = await getSignerOrProvider(true);
        const nftContract = new Contract(NFT_ADDRESS,ABI,signer);
        const address = await signer.getAddress();
        const proofArr = await proof(address);
        const verified = await nftContract.isAllowed(proofArr);
        const tx = await nftContract.mint(quantity,proofArr, verified? {value: (utils.parseEther("0.001")*quantity)}
                                                                    : {value: (utils.parseEther("0.002")*quantity)});
        setLoading(true);
        await tx.wait();
        setLoading(false);
        window.alert(`You have successfully minted ${quantity} Krypto Civilian`)
        getTokenIdsMinted();
      }catch(err){
        console.error(err);
      } 
    }

    async function connectWallet(){
      try{
        await getSignerOrProvider();
        setWalletConnected(true);
      }catch(err){
        console.error(err);
      }
    }

    async function getOwner(){
      try{
        const provider = await getSignerOrProvider();
        const nftContract = new Contract(NFT_ADDRESS,ABI,provider);
        const _owner = await nftContract.owner();
  
        const signer = await getSignerOrProvider(true);
        const address = await signer.getAddress();
        if(address.toLowerCase() === _owner.toLowerCase()){
          setIsOwner(true);
        }
      }catch(err){
      console.error(err.message);
      }
    }

    async function getTokenIdsMinted(){
      try{
        const provider = await getSignerOrProvider();
        const nftContract = new Contract(NFT_ADDRESS,ABI,provider);
        const _tokenIds = await nftContract.totalSupply();
        setTokenIdsMinted(_tokenIds.toString());
      }catch(err){
        console.error(err);
      }
    }

    useEffect(() =>{
      if(!walletConnected){
        web3ModalRef.current = new Web3Modal({
          network:"sepolia",
          providerOptions:{},
          disableInjectedProvider: false,
        });
        connectWallet();
        getTokenIdsMinted();
        checkIfSaleStarted();
      }
    },[walletConnected])

    function renderButton(){
      if(!walletConnected){
        return (<button onClick={connectWallet} className={styles.button}>Connect your wallet</button>);
      }
      if(loading){
        return (<button className={styles.button}>Loading...</button>);
      }
      if(isOwner && !saleStarted){
        return (<button onClick={startSale} className={styles.button}>Start Sale</button>);
      }
      if(!saleStarted){
        return (<button className={styles.button}>Sale hasn't started yet</button>);
      }
      if(saleStarted){
        return(
          <div>
            <div className={styles.description}>
              Sale started!,Mint your Krypto Civilians🥳
            </div>
            <input
              className = {styles.input}
              type="number"
              placeholder="Number of NFTs"
              onChange={(e) => setQuantity(e.target.value)}>
            </input>
            <button onClick={mint} className={styles.button}>
                Mint🚀
            </button>
          </div>
        )
      }
    }
   return (
      <div>
        <Head>
          <title>Krypto Civilians</title>
          <meta name="description" content="Whitelist-Dapp" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to Krypto Civilians!</h1>
            <div className={styles.description}>
              It&#39;s an NFT collection for developers in Crypto.
            </div>
            <div className={styles.description}>
              {tokenIdsMinted}/50 have been minted.
            </div>
            {renderButton()}
          </div>
          <div>
            <img className={styles.image} src="./krypto.svg"/>
          </div>
        </div>
  
        <footer className={styles.footer}>
          Made with &#10084; by Krypto Civilians
        </footer>
      </div>
    );
   }