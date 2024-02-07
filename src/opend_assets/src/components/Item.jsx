import React, { useEffect, useState } from "react";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";
import Button from "./Button";

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [img, setImg] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();

  const id = props.id;

  const localHost = "http://localhost:8080/";
  const agent = new HttpAgent({host: localHost});

  async function loadNFT(){
    const NFTActor = Actor.createActor(idlFactory, {
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

    setButton(<Button handleClick={handleSell} text={"Sell"}></Button>)
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
    setButton(<Button handleClick={handleSell} text={"Confirm"}></Button>)
  }

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={img}
        />
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"></span>
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
