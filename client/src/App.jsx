import './App.css';
import { useState, useEffect } from 'react';
import { addToAppleLibrary, getMusicKitInstance } from './Apple/Apple-Helpers';
import CustomizedForm from "./components/CustomizedForm";
import SearchIcon from "@mui/icons-material/Search";
import { ArrowRight } from "@mui/icons-material";
import { PlaylistCard } from "./components/PlaylistCard/PlaylistCard";
import { ClientEvent } from "clientevent";
import { CircularProgress } from '@mui/material';
import SuccessDialog from './components/SuccessDialog/SuccessDialog';
import ErrorDialog from './components/ErrorDialog';

export function App() {
  const [playlistID, setPlaylistID] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [playlist, setPlaylist] = useState(undefined);
  const [playlistTracks, setPlaylistTracks] = useState(undefined);
  const [musicKit, setMusicKit] = useState(undefined);
  const [isLoading, setLoading] = useState(false);
  const [invalidSongs, setInvalidSongs] = useState([]);

  async function login() {
    /*** Reaches out to the backend, authenticates with Spotify using developer token
     * and creates an Apple MusicKit instance.
     */
    fetch(`${process.env.REACT_APP_BACKEND_ROUTE}/api/login`).then(response => response.json())
      .then(res => {
        console.log("Spotify Auth Successful!")
      }).catch(error => {
        console.log(error)
      })
    let kit = await getMusicKitInstance();
    setMusicKit(kit);
  };

  function getPlaylist() {
    /*** Reaches out to the backend and uses the given playlist ID to retrieve all playlist tracks.*/
    let route = `${process.env.REACT_APP_BACKEND_ROUTE}/api/getPlaylist/` + playlistID;
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

  useEffect(() => {
    login();
    const loadingSub = ClientEvent.subscribe('loading', () => {
      setLoading(true);
    })
    const stopLoadSub = ClientEvent.subscribe('stopped_loading', (songs) => {
      setInvalidSongs(songs);
      setLoading(false);
    })
    return () => {
      loadingSub.unsubscribe();
      stopLoadSub.unsubscribe();

    }
  }, []);

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
            fontSize: '10vw',
            fontFamily: 'Hammersmith One',
            fontWeight: '400',
            wordWrap: 'break-word'
          }}>camb</span>
        <span
          style={{
            color: 'white',
            fontSize: '10vw',
            fontFamily: 'Hammersmith One',
            fontWeight: '400',
            wordWrap: 'break-word'
          }}>.io</span>
      </div>
      <div style={{
        top: "25vh",
        position: 'relative',
        color: 'white',
        fontSize: '5vw',
        fontFamily: 'Hammersmith One',
        fontWeight: '400',
        wordWrap: 'break-word'
      }}>Transfer Spotify Playlists to Apple Music
      </div>
      <div style={{ position: 'relative', top: '30vh' }}>
        <CustomizedForm onSubmit={getPlaylist}
          onChange={e => {
            e.preventDefault();
            let id = e.target.value;
            id = id.replace("https://open.spotify.com/playlist/", "");
            setPlaylistID(id)
          }}
          icon={<SearchIcon />}
          placeholder={"Spotify Playlist URL"}
        /></div>
      {!!playlist ?
        <>
          <PlaylistCard
            name={playlist.name}
            no_of_songs={playlistTracks.length}
            images={playlist.images}
            uid={playlist.id}
            onCancel={() => {
              setPlaylist(undefined);
              setPlaylistTracks(undefined);
            }}
          />
          <div style={{ position: "relative", top: "40vh" }}>
            <CustomizedForm onSubmit={() => {
              musicKit.authorize().then(async (val) => {
                let name = playlistName.length > 0 ? playlistName : playlist.name;
                await addToAppleLibrary(playlistTracks, name, musicKit);
              })
            }}
              onChange={e => {
                let name = e.target.value;
                setPlaylistName(name);
              }}
              icon={<ArrowRight />}
              placeholder={"New Playlist Name (or Press Enter)"}
            />
            {isLoading ? <CircularProgress style={{ position: "relative", left: "-25vw", top: "-8vh" }} /> : null}
          </div>
        </>
        : null}
      <SuccessDialog invalidSongs={invalidSongs} />
      <ErrorDialog/>
    </div>
  );
}

export default App;
