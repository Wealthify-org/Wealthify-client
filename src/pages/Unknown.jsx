import React from "react";
import { Link } from 'react-router-dom'
import { getPathByComponent } from "../router/routes";
import Start from "./Start";
import AbstractBackgroundMesh from "../components/UI/abstractBackgroundShapes/abstractBackgroundMesh";

const Unknown = () => {
  return (
    <div className="pageContainerUnknown">
      <AbstractBackgroundMesh />
      <h1 className="hText">Page not found :(</h1>
      <p className="pText">You've entered the wrong page address, go to start page.</p>
      <Link to={getPathByComponent(Start, true)} >
        <button className="goToStartPageButton">Go</button>
      </Link>
    </div>
  )
}

export default Unknown