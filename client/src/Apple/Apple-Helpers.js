export async function getMusicKitInstance() {
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

export async function getHeader(musicKit) {
    console.log("getHeader")
    // let kit = await getMusicKitInstance();

    const header = {
        Authorization: `Bearer ${musicKit.developerToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Music-User-Token': musicKit.musicUserToken
    }
    return header
}

export async function addToAppleLibrary(playlist, name, musicKit) {

    console.log("addToAppleLibrary")

    var songsInPlaylists = [];


    // store.dispatch(updateCurrentSearchingPlaylist(playlist.name))

    songsInPlaylists = [];
    playlist.forEach((item) => {
        songsInPlaylists.push({ a_name: item.artistName[0], t_name: item.trackName })
    })

    const headers = await getHeader(musicKit);

    const res = await Promise.all([
        songsInPlaylists.map((song) => new Promise((resolve, reject) => {
            findSong(song.a_name, song.t_name, resolve, reject, headers);
        }))
    ]);
    Promise.all(res[0])
        .then(async (resolvedPlaylist) => {
            const invalidSongs = await createPlaylistInAppleLib({ name: name, tracks: resolvedPlaylist }, headers);
            console.log("Invalid Songs: ", invalidSongs);
        });

}

export function findSong(artist, song, resolve, reject, headers) {

    let extractedSong = extractSongNameVerbose(song)
    let searchparam = artist + ' ' + extractedSong.replace(/ /g, '+')

    extractedSong = encodeURIComponent(extractedSong)
    searchparam = encodeURIComponent(searchparam)

    var url1 = 'https://api.music.apple.com/v1/catalog/us/search?term=' + extractedSong + '&limit=25&types=songs'
    var url2 = 'https://api.music.apple.com/v1/catalog/us/search?term=' + searchparam + '&limit=25&types=songs'

    new Promise(async (resolve, reject) => {
        await apiSearchHelper2(url1, url2, resolve, reject, artist, song, 1, headers);
    })
        .then((result) => {
            resolve(result)
        }).catch((error) => {
            console.log(error);
        })
}

// export function apiSearchHelper(url, url2, resolve, reject, artist, song, delay, headers) {
//     let data = {};

//     fetch(url, {
//         headers: headers
//     }).then((response) => {
//         var res = response.json()
//         var status = response.status;
//         res.then((response) => {
//             if (status !== 200) {
//                 if (delay > 10000) {
//                     return
//                 }
//                 if (status === 429) {
//                     console.log(response.message)
//                     console.log("we got in the after 429")
//                     delay = delay * 2
//                     console.log("retrying after seconds: " + delay)
//                     setTimeout(() => {
//                         console.log('Calling recursive function')
//                         apiSearchHelper(url, url2, resolve, reject, artist, song, delay, headers);
//                     }, delay * 1000);
//                 }

//                 if (status === 400) {
//                     console.log('We got a 400 because of ' + song + ' by ' + artist)
//                     resolve({ id: `We could not find ${song} by ${artist}` })
//                 }

//                 return
//             }
//             let added = false
//             if (response.results.songs !== undefined) {
//                 for (var i = 0; i < response.results.songs.data.length; i++) {
//                     if (artistExists(artist, splitArtists(response.results.songs.data[i].attributes.artistName))) {
//                         data.id = response.results.songs.data[i].id
//                         data.type = 'songs'
//                         resolve(data)
//                         added = true;
//                         break;
//                     }
//                 }
//             }

//             if (added) {
//                 return;
//             }

//             fetch(url2, {
//                 headers: headers
//             }).then((response) => {
//                 var res = response.json()
//                 var status = response.status;
//                 res.then((response) => {
//                     if (status !== 200) {
//                         if (delay > 10000) {
//                             return
//                         }

//                         console.log("Tried URL Two, URL One did not work")
//                         if (status === 429) {
//                             console.log(response.message)
//                             console.log("we got in the after 429")
//                             console.log("retrying after milliseconds: " + delay)
//                             delay = delay * 2
//                             setTimeout(() => {
//                                 apiSearchHelper(url, url2, resolve, reject, artist, song, delay, headers)
//                             }, delay * 1000);
//                         }

//                         if (status === 400) {
//                             console.log('We got a 400 because of ' + song + ' by ' + artist)
//                             resolve({ id: `We could not find ${song} by ${artist}` })
//                         }

//                         return
//                     }
//                     let added = false
//                     if (response.results.songs !== undefined) {
//                         for (var i = 0; i < response.results.songs.data.length; i++) {
//                             if (artistExists(artist, splitArtists(response.results.songs.data[i].attributes.artistName))) {
//                                 data.id = response.results.songs.data[i].id
//                                 data.type = 'songs'
//                                 added = true;
//                                 resolve(data)
//                                 break;
//                             }
//                         }
//                     }

//                     if (!added) {
//                         resolve({ id: `We could not find ${song} by ${artist}` })
//                     }
//                 })
//             }).catch((error) => {
//                 console.log('Error', error)
//                 if (delay > 10000) {
//                     return
//                 }

//                 delay = delay * 2
//                 setTimeout(() => {
//                     apiSearchHelper(url, url2, resolve, reject, artist, song, delay, headers)
//                 }, delay * 1000);
//             })

//         }).catch((error) => {
//             console.log("caught dat thang", error)
//         })
//     }).catch((error) => {
//         console.log('Error', error)
//         if (delay > 10000) {
//             return
//         }

//         delay = delay * 2
//         setTimeout(() => {
//             apiSearchHelper(url, resolve, reject, artist, song, delay, headers)
//         }, delay * 1000);
//     })
// }

export async function apiSearchHelper2(url, url2, resolve, reject, artist, song, delay, headers) {
    let data = {};

    await fetch(url, {
        headers: headers
    }).then(async (response) => {
        console.log("response", response)
        if (response.status !== 200) {
            if (delay > 10000) {
                return
            }
            if (response.status === 429) {
                console.log("handling 429")

                delay = delay * 2
                console.log("retrying after seconds: " + delay)
                setTimeout(async () => {
                    console.log('Calling recursive function')
                    await apiSearchHelper2(url, url2, resolve, reject, artist, song, delay, headers);
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
                        console.log(response.message)
                        console.log("we got in the after 429")
                        console.log("retrying after milliseconds: " + delay)
                        delay = delay * 2
                        setTimeout(() => {
                            apiSearchHelper2(url, url2, resolve, reject, artist, song, delay, headers)
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
            setTimeout(() => {
                apiSearchHelper2(url, url2, resolve, reject, artist, song, delay, headers)
            }, delay * 1000);
        })


    })


}

export async function createPlaylistInAppleLib(thePlayList, headers) {
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
    let arr = songArtist.map((artist) => {
        return artist.toLowerCase()
    })
    return arr.indexOf(artist.toLowerCase()) > -1
}

export function splitArtists(artists) {
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