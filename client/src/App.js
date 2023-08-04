import './App.css';
import {useState, useEffect} from 'react';
import {addToAppleLibrary, getMusicKitInstance} from './Apple/Apple-Helpers';
import CustomizedInputBase from "./components/CustomizedInputBase";


export function App() {
  const [playlistID, setPlaylistID] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [playlist, setPlaylist] = useState(undefined);
  const [musicKit, setMusicKit] = useState(undefined);

  async function login() {
    /*** Reaches out to the backend, authenticates with Spotify using developer token
     * and creates an Apple MusicKit instance.
     */
    fetch("/api/login").then(response => response.json())
      .then(res => {
        console.log("Spotify Auth Successful!")
      }).catch(error => {
      console.log(error)
    })
    let kit = await getMusicKitInstance();
    setMusicKit(kit);
  };

  useEffect(() => {
    login();
  }, []);

  function getPlaylistTracks() {
    /*** Reaches out to the backend and uses the given playlist ID to retrieve all playlist tracks.*/
    let route = "/api/getPlaylist/" + playlistID;
    fetch(route).then(
      function (res) {
        res.json().then((data) => {
          console.log(data);
          setPlaylist(data);
        })
      },
      function (err) {
        console.log('Could not retrieve playlist')
      }
    )
  }

  return (
    <div className="App">
      <div style={{
        top: "25vh",
        position: 'relative',
        textAlign: 'center'
      }}>
          <span
            style={{
              color: 'black',
              fontSize: 128,
              fontFamily: 'Hammersmith One',
              fontWeight: '400',
              wordWrap: 'break-word'
            }}>camb</span>
        <span
          style={{
            color: 'white',
            fontSize: 128,
            fontFamily: 'Hammersmith One',
            fontWeight: '400',
            wordWrap: 'break-word'
          }}>.io</span>
      </div>
      <div style={{
        top: "25vh",
        position: 'relative',
        color: 'white',
        fontSize: 46.56,
        fontFamily: 'Hammersmith One',
        fontWeight: '400',
        wordWrap: 'break-word'
      }}>Transfer Spotify Playlists to Apple Music
      </div>
      <div style={{position: 'relative', top: '30vh', left: '28vw'}}>
        <CustomizedInputBase onSubmit={getPlaylistTracks}
                             onChange={e => {
                                        let id = e.target.value;
                                        id = id.replace("https://open.spotify.com/playlist/", "");
                                        setPlaylistID(id)
        }}/>
        {!!playlist ?
          <div style={{position: "relative", top: "30vh"}}>
            New Playlist Name:
            <form onSubmit={(e) => {
              e.preventDefault();
              musicKit.authorize().then(async (val) => {
                await addToAppleLibrary(playlist, playlistName, musicKit);
              })
            }}>
              <input type="text" onChange={e => {
                let name = e.target.value;
                setPlaylistName(name);
              }}
              />
              <button type={"submit"}>Convert!</button>
            </form>
          </div>
          : null}
      </div>
    </div>
  );
}

export default App;
