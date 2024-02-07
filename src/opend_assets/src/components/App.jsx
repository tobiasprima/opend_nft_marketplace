import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Minter from "./Minter";
import Item from "./Item";
import "bootstrap/dist/css/bootstrap.min.css";
import homeImage from "../../assets/home-img.png";

function App() {

  const NFTID = "rrkah-fqaaa-aaaaa-aaaaq-cai";

  return (    
    <div className="App">
      <Header />
      <Minter></Minter>
      {/* <Item id={NFTID}></Item>  */}
      {/* <img className="bottom-space" src={homeImage} /> */}
      <Footer />
    </div>
  );
}

export default App;
