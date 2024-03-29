import React, { useEffect, useState } from "react";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory } from "../../../declarations/token";
import { Principal } from "@dfinity/principal";
import { opend } from "../../../declarations/opend";
import Button from "./Button";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [img, setImg] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState();
  const [priceLabel, setPriceLabel]= useState();
  const [shouldDisplay, setDisplay] = useState(true);

  const id = props.id;

  const localHost = "http://localhost:8080/";
  const agent = new HttpAgent({host: localHost});
  // When deploying live, remove this line below
  agent.fetchRootKey();
  // 
  let NFTActor;

  async function loadNFT(){
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });
    const nftName = await NFTActor.getName()
    const nftOwner = await NFTActor.getOwner();
    const imageData = await NFTActor.getContent();

    const imageContent = new Uint8Array(imageData);
    const imageUrl = URL.createObjectURL(new Blob([imageContent.buffer], {type: "image/png"}));
    setName(nftName);
    setOwner(nftOwner.toText());
    setImg(imageUrl);

    if(props.role == "collection"){
      const nftIsListed = await opend.isListed(props.id);

      if(nftIsListed){
        setOwner("OpenD");
        setBlur({filter: "blur(4px)"});
        setSellStatus("Listed");
      }else {
        setButton(<Button handleClick={handleSell} text={"Sell"}></Button>)
      }
    } else if (props.role == "discover"){
      const originalOwner = await opend.getOriginalOwner(props.id);
      if(originalOwner.toText() != CURRENT_USER_ID.toText()){
        setButton(<Button handleClick={handleBuy} text={"Buy"}></Button>)
      }
      const price = await opend.getListedNFTPrice(props.id);
      setPriceLabel(<PriceLabel sellPrice={price.toString()}></PriceLabel>);
    }
  }

  async function handleBuy(){
    console.log("Buy was triggered");
    setLoaderHidden(false);
    const tokenActor = await Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"), //Token's Canister ID
    });

    const sellerId = await opend.getOriginalOwner(props.id);
    const itemPrice = await opend.getListedNFTPrice(props.id);

    const result = await tokenActor.transfer(sellerId, itemPrice);
    console.log(result);
    if(result == "Success"){
       const transferResult = await opend.completePurchase(props.id, sellerId, CURRENT_USER_ID);
       console.log("Transfer: " + transferResult);
       setLoaderHidden(true);
       setDisplay(false);
    }
  }
    

  useEffect(()=> {
    loadNFT();
  }, []);

  let price;

  function handleSell(){
    setPriceInput(<input
      placeholder="Price in DBEY"
      type="number"
      className="price-input"
      value={price}
      onChange={(e)=> price = e.target.value}
    />)
    setButton(<Button handleClick={sellItem} text={"Confirm"}></Button>)
  }

  async function sellItem(){
    setBlur({filter: "blur(4px)"})
    setLoaderHidden(false);
    console.log("Set Price: " + price);
    const resultListing = await opend.listItem(props.id, Number(price));
    console.log("listing:" +  resultListing)
    if(resultListing == "Success"){
      const openDID = await opend.getOpenCanisterId();
      const transferResult = await NFTActor.transferOwnership(openDID);
      console.log("Transfer:" + transferResult);
      if (transferResult == "Success"){
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setOwner("OpenD");
        setSellStatus("Listed");
      }
    }
  }

  return (
    <div style={{display: shouldDisplay ? "inLine" : "none"}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={img}
          style={blur}
        />
        <div hidden={loaderHidden} className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
        {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text">{sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
