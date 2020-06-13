import React from "react";
import logo from "../logo.svg";

const YolyBratt = () => {
  return (
    <div className="photo-group">
      <img src="yoly.png" alt="yoly" className="yoly" />
      <img src={logo} className="App-logo" alt="logo" />
      <img src="bratt.png" alt="bratt" className="bratt" />
    </div>
  );
};

export default YolyBratt;
