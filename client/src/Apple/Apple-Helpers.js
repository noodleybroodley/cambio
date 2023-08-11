import { ClientEvent } from "clientevent";

export async function getMusicKitInstance() {
    /** Gets MusicKit Instance using Apple Dev Token
     * 
     * Params: n/a
     * Return: MusicKit Instance
    */
    const appleInstance = window.MusicKit;
    let musicKit;
    return fetch("/api/appleToken").then(response => response.json())
        .then(res => {
            appleInstance.configure({
                developerToken: res.token,
                app: {
                    name: 'Playlist Converter',
                    build: '1978.4.1'
                }
            });
            musicKit = appleInstance.getInstance();
            console.log("got music instance");
            return musicKit;
        })
        .catch((error) => {
            console.log(error)
        })
}

export async function getHeaders(musicKit) {
    /**Creates Headers for MusicKit API Requests
     * 
     * Params: MusicKit Instance
     * Return: Headers Object
    */

    const headers = {
        Authorization: `Bearer ${musicKit.developerToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Music-User-Token': musicKit.musicUserToken
    }
    return headers
}

export async function addToAppleLibrary(playlist, name, musicKit) {
    /**Creates a new Apple Music playlist using tracks from the given Spotify Playlist.
     * 
     * Params:
     * playlist: {albumArtist: String[], albumName: String, artistName: String[], trackName: String}
     * name: String
     * musicKit: MusicKit Instance
     * 
     * Return:
     * Promise<void>
    */

    ClientEvent.emit('loading');
    var songsInPlaylists = [];
    playlist.forEach((item) => {
        songsInPlaylists.push({ a_name: item.artistName[0], t_name: item.trackName })
    })

    const headers = await getHeaders(musicKit);

    //create a list of promises that will search for each song
    const res = await Promise.all(
        songsInPlaylists.map((song) => new Promise((resolve, reject) => {
            findSong(song.a_name, song.t_name, resolve, headers);
        }))
    );

    //fulfill all promises in the list and use the resulting playlist to create a new Apple Music Playlist
    Promise.all(res)
        .then(async (resolvedPlaylist) => {
            const invalidSongs = await createPlaylistInAppleLib({ name: name, tracks: resolvedPlaylist }, headers);
            ClientEvent.emit('stopped_loading',invalidSongs);
        });

}

export function findSong(artist, song, resolve, headers) {
    /**Searches either for the given song or the song and the artists
     * 
     * Params:
     * artist: String
     * song: String
     * resolve: Function (resolves outer promise with song value)
     * headers: Headers Object
    */
    let extractedSong = extractSongNameVerbose(song)
    let searchparam = artist + ' ' + extractedSong.replace(/ /g, '+')

    extractedSong = encodeURIComponent(extractedSong)
    searchparam = encodeURIComponent(searchparam)

    var url1 = 'https://api.music.apple.com/v1/catalog/us/search?term=' + extractedSong + '&limit=25&types=songs'
    var url2 = 'https://api.music.apple.com/v1/catalog/us/search?term=' + searchparam + '&limit=25&types=songs'

    new Promise(async (resolve, reject) => {
        await apiSearchHelper(url1, url2, resolve, artist, song, 1, headers);
    })
        .then((result) => {
            resolve(result)
        }).catch((error) => {
            console.log(error);
        })
}

export async function apiSearchHelper(url, url2, resolve, artist, song, delay, headers) {
    /**Searches either for the given song or the song and the artists
     * 
     * Params:
     * url: search url with song name
     * url2: search url with song name and artist
     * resolve: function that resolves outer promise
     * artist: String
     * song: String
     * delay: Number
     * headers: Headers object
     * 
     * Return:
     * Promise<void>
     */
    let data = {};

    await fetch(url, {
        headers: headers
    }).then(async (response) => {
        
        if (response.status !== 200) {
            if (delay > 10000) {
                return
            }
            if (response.status === 429) {
                //if first url search was unsuccessful due to "429: Too Many Requests Error", retry search after a delay
                console.log("handling 429")

                delay = delay * 2
                console.log("retrying after seconds: " + delay)
                setTimeout(async () => {
                    console.log('Calling recursive function')
                    await apiSearchHelper(url, url2, resolve, artist, song, delay, headers);
                }, delay * 1000);
            }

            if (response.status === 400) {
                console.log('We got a 400 because of ' + song + ' by ' + artist)
                resolve({ id: `We could not find ${song} by ${artist}` })
            }

            return
        }
        let added = false
        let res = await response.json();
        if (res.results.songs !== undefined) {
            for (var i = 0; i < res.results.songs.data.length; i++) {
                if (artistExists(artist, splitArtists(res.results.songs.data[i].attributes.artistName))) {
                    data.id = res.results.songs.data[i].id
                    data.type = 'songs'
                    resolve(data)
                    added = true;
                    break;
                }
            }
        }

        if (added) {
            return;
        }

        await fetch(url2, {
            headers: headers
        }).then(async (response) => {
            
                if (response.status !== 200) {
                    if (delay > 10000) {
                        return
                    }

                    console.log("Tried URL Two, URL One did not work")
                    if (response.status === 429) {
                        //if url2 search was unsuccessful due to "429: Too Many Requests Error", retry search after a delay
                        console.log("we got in the after 429")
                        console.log("retrying after milliseconds: " + delay)
                        delay = delay * 2
                        setTimeout(async () => {
                            await apiSearchHelper(url, url2, resolve, artist, song, delay, headers)
                        }, delay * 1000);
                    }

                    if (response.status === 400) {
                        console.log('We got a 400 because of ' + song + ' by ' + artist)
                        resolve({ id: `We could not find ${song} by ${artist}` })
                    }

                    return
                }
                let added = false
                let res = await response.json();
                if (res.results.songs !== undefined) {
                    for (var i = 0; i < res.results.songs.data.length; i++) {
                        if (artistExists(artist, splitArtists(res.results.songs.data[i].attributes.artistName))) {
                            data.id = res.results.songs.data[i].id
                            data.type = 'songs'
                            added = true;
                            resolve(data)
                            break;
                        }
                    }
                }

                if (!added) {
                    resolve({ id: `We could not find ${song} by ${artist}` })
                }
            
        }).catch((error) => {
            console.log('Error', error)
            if (delay > 10000) {
                return
            }

            delay = delay * 2
            setTimeout(async() => {
                await apiSearchHelper(url, url2, resolve, artist, song, delay, headers)
            }, delay * 1000);
        })


    })


}

export async function createPlaylistInAppleLib(thePlayList, headers) {
    /**Create new Apple Music Playlist using given track IDs and playlist name; returns list of invalid songs
     * 
     * Params:
     * thePlaylist: { name: String, tracks: {id: String, type: String}[] }
     * headers: Headers Object
     * 
     * Return: String[]
    */
    var validIDs = [];
    var invalidSongs = [];
    thePlayList.tracks.forEach((t) => {
        if (t.id.includes("We could not find")) {
            invalidSongs.push(t.id.toString().substring(18))
        } else {
            validIDs.push(t)
        }
    })

    let data = {
        "attributes": {
            "name": thePlayList.name,
            "description": "..."
        },
        "relationships": {
            "tracks": {
                "data": validIDs
            }
        }
    }

    fetch('https://api.music.apple.com/v1/me/library/playlists', {
        headers: headers,
        method: "POST",
        body: JSON.stringify(data),
        mode: 'cors'
    }).then((response) => {
        var res = response.json()
        var status = response.status;

        res.then((response) => {
            if (status !== 201) {
                console.log(status)
                console.log(response.error)
                console.log("There was an error creating the playlis with the songs")
                return;
            }
            console.log("Successfully Converted from Spotify to Apple Music!");
            return;
        })
    }).catch((error) => {
        console.log(error)
    })
    return invalidSongs;
}

export function extractSongNameVerbose(str) {
    /**Takes raw song name, strips extraneous terms and returns song name
     * 
     * Param:
     * str: String
     * 
     * Return: String
    */
    // remove (outro)
    // feat
    if (str.includes('(feat. ')) {
        return str.substring(0, str.indexOf('(feat. '))
    }
    if (str.includes('(Outro')) {
        return str.substring(0, str.indexOf('(Outro'))
    }
    if (str.includes('- Outro')) {
        return str.substring(0, str.indexOf('- Outro'))
    }
    if (str.includes('- Single')) {
        return str.substring(0, str.indexOf('- Single'))
    }
    if (str.includes('(Single')) {
        return str.substring(0, str.indexOf('(Single'))
    }

    // add curse words
    if (str.includes('f**k')) {
        str.replace('f**k', 'fuck')
    }
    if (str[str.length - 1] === ' ') {
        return (str.substring(0, str.length - 1))
    }
    return str
}

export function artistExists(artist, songArtist) {
    /**Determines if artist appears in song search results.
     * 
     * Params:
     * artist: String
     * songArtist: String[]
     * 
     * Return: Boolean
    */
    let arr = songArtist.map((artist) => {
        return artist.toLowerCase();
    })

    return arr.findIndex(element => artist.toLowerCase().includes(element)) > -1;
}

export function splitArtists(artists) {
    /**Takes artists string and splits it into an array of strings
     * 
     * Param:
     * artists: String
     * 
     * Return:
     * String[]
     * 
    */
    let seperatedArtists = []
    let firstSplit = artists.split(', ')
    for (let i = 0; i < firstSplit.length; i++) {
        let secondSplit = firstSplit[i].split(' & ')
        if (secondSplit.length < 2) {
            seperatedArtists.push(secondSplit[0])
        }
        else {
            // seperate by &
            secondSplit.forEach(
                (e) => {
                    seperatedArtists.push(e)
                }
            )
        }
    }
    return seperatedArtists
}