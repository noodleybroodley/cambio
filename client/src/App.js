import './App.css';
import { useState, useEffect } from 'react';
import { addToAppleLibrary, getMusicKitInstance } from './Apple/Apple-Helpers';


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
                console.log("Spotify Auth Successful!: ", res)
            }).catch(error => { console.log(error) })
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
            <header className="App-header">
                <h1>CAMB.io</h1>
                <h3>The Spotify/Apple Music Playlist Converter</h3>
                <div>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        getPlaylistTracks();
                    }}>
                        <input type="text" onChange={e => {
                            let id = e.target.value;
                            id = id.replace("https://open.spotify.com/playlist/", "");
                            setPlaylistID(id);
                        }}
                        />
                        <button type={"submit"}>Search</button>
                    </form>
                    {!!playlist ?
                        <div>
                            New Playlist Name:
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                musicKit.authorize().then(async (val)=>{
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
            </header>
        </div>
    );
}

export default App;
