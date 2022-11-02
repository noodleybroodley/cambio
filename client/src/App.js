import './App.css';
import { useState, useEffect } from 'react';


export function App() {
    const [playlistID, setPlaylistID] = useState("");
    const [playlistName, setPlaylistName] = useState("");
    const [playlist, setPlaylist] = useState(undefined);

    function login() {
        fetch("/api/login").then(
            function (data) {
                console.log("successfully logged in: ", data)
            },
            function (err) {
                console.log(
                    'Something went wrong when retrieving an access token',
                    err.message
                );
            }
        )
        fetch("/api/appleToken").then(
            function (data) {
                console.log("apple music token: ",data)
            },
            function (err) {
                console.log(
                    'Something went wrong when retrieving an access token',
                    err.message
                );
            }
        )
    }
    useEffect(() => {
        login();
    }, []);

    function getAlbumInfo() {
        fetch("/api/test").then(
            function (data) {
                // const result = await streamToString(data.body)
                console.log(data)
            },
            function (err) {
                console.log('Could not retrieve album info')
            }
        )
    }

    function getPlaylistTracks() {
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
                                console.log('convert!');
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
