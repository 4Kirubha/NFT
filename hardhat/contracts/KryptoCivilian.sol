// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract KryptoCivilian is ERC721A,Ownable {
    bytes32 public merkleRoot;
    string _baseTokenURI;
    uint public maxMints = 5;
    uint public maxSupply = 50;
    uint public _wPrice = 0.001 ether;
    uint public _publicPrice = 0.002 ether;
    bool public paused;
    bool public saleStarted;

    modifier whenNotPaused{
        require(!paused,"Contract currently running");
        _;
    }

    constructor (string memory baseTokenURI, bytes32 _merkleRoot) ERC721A("Krypto Civilian","KC") {
        _baseTokenURI = baseTokenURI;
        merkleRoot = _merkleRoot;
    }
    function startSale() public onlyOwner{
        saleStarted = true;
    }

    //mints NFTs takes no. of NFTs want to mint and proof

    function mint(uint quantity,bytes32[] calldata proof) public payable whenNotPaused{
        require(saleStarted,"Sale not yet Started");
        if(isAllowed(proof)){
            require(quantity + _numberMinted(msg.sender) <= maxMints,"Limit Exceeded");
            require((totalSupply() + quantity) <= maxSupply,"All tokens minted");
            require(msg.value >= (_wPrice * quantity),"Ether sent not sufficient");
            _safeMint(msg.sender,quantity);
        }else{
            require(quantity + _numberMinted(msg.sender) <= maxMints,"Limit Exceeded");
            require((totalSupply() + quantity) <= maxSupply,"All tokens minted");
            require(msg.value >= (_publicPrice * quantity),"Ether sent not sufficient");
            _safeMint(msg.sender,quantity);
        }
    }

    function _baseURI() internal view virtual override returns(string memory){
        return _baseTokenURI;
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    function isAllowed(bytes32[] calldata proof) view public returns(bool){
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        return MerkleProof.verify(proof,merkleRoot,leaf);
    }
    function setPaused(bool val) public {
        paused = val;
    }

    function withdraw() public payable onlyOwner{
        address _owner = owner();
        uint amount = address(this).balance;
        (bool sent,) = _owner.call{value:amount}("");
        require(sent,"Ether transaction failed");
    }

    receive() external payable{}

    fallback() external payable{}

}