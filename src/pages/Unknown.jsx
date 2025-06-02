import React from "react";
import { Link } from 'react-router-dom'
import { getPathByComponent } from "../router/routes";
import Start from "./Start";

const Unknown = () => {
  return (
    <div>
      <h1 className="hText">Page not found :(</h1>
      <p className="pText">You've entered the wrong page address, go to start page.</p>
      <Link to={getPathByComponent(Start, true)} >
        <button className="trybtn" style={{margin: '2vh 2.75rem', padding: '0.8rem 10rem'}} >Go</button>
      </Link>
    </div>
  )
}

export default Unknown