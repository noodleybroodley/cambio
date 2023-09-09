const express = require('express');
const app = express();
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const cors = require('cors');
app.use(cors({
    origin: `${process.env.FRONTEND_URL}`
}));

let spotifyApi = new SpotifyWebApi({
    clientId: `${process.env.REACT_APP_ID}`,
    clientSecret: `${process.env.REACT_APP_SECRET}`,
    redirectUri: `${process.env.FRONTEND_URL}/`
});

app.get("/api/login", (req, res) => {
    /** Reaches out to Spotify API and performs client credentials grant,
     * then sets the access token for the Spotify Web API instance.*/
    spotifyApi.clientCredentialsGrant().then(
        function (data) {
            console.log('The access token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);

            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
        },
        function (err) {
            console.log(
                'Something went wrong when retrieving an access token',
                err.message
            );
        })
    res.json(spotifyApi);
});
app.get("/api/logout", (req, res) => {
    /** Removes Access Token from Spotify Web API instance.*/
    spotifyApi.setAccessToken("");
    res.json(spotifyApi);
})

function extractSongName(str) {
    /** Takes a raw song name string and returns just the song title without featured artists
     * Param:
     * str: String
     *
     * Return:
     * String*/
    if (str.includes('(feat. ')) {
        return str.substring(0, str.indexOf('(feat. '))
    }
    else if (str.includes('(Feat. ')) {
        return str.substring(0, str.indexOf('(Feat. '))
    }
    else if (str.includes('(with ')) {
        return str.substring(0, str.indexOf('(with '))
    }
    return str
}


async function getAllSongs(id) {
    /** Gets all tracks from a given Spotify playlist.
     * Param:
     * id: String
     *
     * Return:
     * {trackName: String, artistName: String[], albumName: String, albumArtist: String[]}[]
     * */
    var data = await spotifyApi.getPlaylistTracks(id);
    var numBatches = Math.floor(data.body.total / 100) + 1;
    var promises = [];
    for (let batchNum = 0; batchNum < numBatches; batchNum++) {
        var promise = getSongs(id, batchNum * 100);
        promises.push(promise);
    }
    var rawSongData = await Promise.all(promises);
    var songs = [];
    for (let i = 0; i < rawSongData.length; i++) {
        let editedSongs = [];
        rawSongData[i].body.items.forEach((data) => {
            let cur = {};
            if (data.track !== null) {
                cur["trackName"] = extractSongName(data.track.name);
                cur["artistName"] = [];
                data.track.artists.forEach((artist) => {
                    cur["artistName"].push(artist.name)
                })
                // add album parameters
                cur["albumName"] = data.track.album.name
                cur["albumArtist"] = []
                data.track.album.artists.forEach((artist) => {
                    cur["albumArtist"].push(artist.name)
                })
                editedSongs.push(cur)
            }
        })
        songs = songs.concat(editedSongs)
        // songs = songs.concat(rawSongData[i].body.items);
    }
    return songs;
}

async function getSongs(id, offset) {
    /** Uses Spotify Web API to get the raw data for each song in a playlist
     * Params:
     * id: String
     * offset: Number}
     *
     * Return:
     * Object*/
    var songs = await spotifyApi.getPlaylistTracks(id, { offset: offset });
    return songs;
}
app.get("/api/getPlaylist/:id", async (req, res) => {
    /** Backend endpoint for getting all songs in a playlist*/
    var songs = await getAllSongs(req.params.id).catch(err => err);
    var playlist = await spotifyApi.getPlaylist(req.params.id).catch(err => err);
    let message = playlist.body?.error ? `request failed because of ${playlist.body?.error.message}` : "got playlist successfully";
    console.log("hit getPlaylist endpoint, ",message);
    res.send([songs, playlist]);
})

//Apple Music

const jwt = require('jsonwebtoken')

const private_key = `${process.env.APPLE_MUSIC_SECRET}`
const team_id = `${process.env.APPLE_MUSIC_TEAM_ID}`
const key_id = `${process.env.APPLE_MUSIC_ID}`

//Use private key, team id and key id to get Apple Music Auth Token
const token = jwt.sign({}, private_key, {
    algorithm: 'ES256',
    expiresIn: '180d',
    issuer: team_id,
    header: {
        alg: 'ES256',
        kid: key_id
    }
})

app.get('/api/appleToken', (req, res) => {
    /** Endpoint to retrieve Apple Music Token*/
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ token: token }))
})

app.listen(8080, () => {
    console.log("Server started on port 8080")
})

// module.exports = {spotifyApi};