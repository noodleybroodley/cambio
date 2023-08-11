import { ClientEvent } from "clientevent";

export async function login(getMusicKitInstance,setMusicKit) {
	/*** Reaches out to the backend, authenticates with Spotify using developer token
     * and creates an Apple MusicKit instance.
     */
    fetch(process.env.REACT_APP_ROUTE+"/api/login").then(response => response.json())
      .then(res => {
        console.log("Spotify Auth Successful!")
      }).catch(error => {
        console.log(error)
      })
    let kit = await getMusicKitInstance();
    setMusicKit(kit);
}

export function getPlaylist(playlistID,setPlaylistTracks,setPlaylist) {
    /*** Reaches out to the backend and uses the given playlist ID to retrieve all playlist tracks.*/
    let route = process.env.REACT_APP_ROUTE + "/api/getPlaylist/" + playlistID;
    fetch(route).then((res) => {
      res.json().then((data) => {
        if (data[0].body?.error) {
          ClientEvent.emit('error', { type: "Playlist Error", message: "Enter valid playlist URL!" });
        } else {
          setPlaylistTracks(data[0]);
          setPlaylist(data[1].body);
        }
      })
    }
    )
  }