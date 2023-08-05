import React from 'react'
import IconButton from "@mui/material/IconButton";
import {CancelRounded} from "@mui/icons-material";

export function PlaylistCard (props) {
  /** Playlist thumbnail component*/
  return (
    <div className="music"
         style={{backgroundColor: "black", height: 300, width: 300, margin: "auto", position: "relative", top: "35vh"}}>
      <IconButton style={{color: "red"}} onClick={props.onCancel}>
        <CancelRounded/>
      </IconButton>
      <div className="image-wrapper">
        <img id={props.uid} src={props.images[0].url} alt="Song cover" style={{height: 200, width: 200}}/>
      </div>
      <div className="right">
        <span className="name"
              style={{color: "white"}}>{props.name.length > 19 ? props.name.substring(0, 19) + '...' : props.name}</span>
        <span className="songs" style={{color: "white"}}>{" ("+props.no_of_songs+" tracks)"}</span>
      </div>
    </div>
  )
}

export default PlaylistCard