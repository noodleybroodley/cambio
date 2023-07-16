const express = require('express');
const app = express();
const SpotifyWebApi = require('spotify-web-api-node');
const MusicKit = require('node-musickit-api/personalized');
require('dotenv').config();

let spotifyApi = new SpotifyWebApi({
    clientId: `${process.env.REACT_APP_ID}`,
    clientSecret: `${process.env.REACT_APP_SECRET}`,
    redirectUri: "http://localhost:3000/"
});

app.get("/api/login", (req, res) => {
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
    spotifyApi.setAccessToken("");
    res.json(spotifyApi);
})

function extractSongName(str) {
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
    var data = await spotifyApi.getPlaylistTracks(id);
    console.log("playlist: ", data.body);
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
    var songs = await spotifyApi.getPlaylistTracks(id, { offset: offset });
    return songs;
}
app.get("/api/getPlaylist/:id", async (req, res) => {
    var songs = await getAllSongs(req.params.id);
    res.send(songs);
})

//Apple Music

let appleApi;
const jwt = require('jsonwebtoken')
const fs = require('fs')

const private_key = `${process.env.APPLE_MUSIC_SECRET}`
const team_id = `${process.env.APPLE_MUSIC_TEAM_ID}`
const key_id = `${process.env.APPLE_MUSIC_ID}`

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
    res.setHeader('Content-Type', 'application/json');
    // appleApi = new MusicKit({
    //     key: `${process.env.APPLE_MUSIC_SECRET}`,
    //     teamId: `${process.env.APPLE_MUSIC_TEAM_ID}`,
    //     keyId: `${process.env.APPLE_MUSIC_ID}`,
    //     userToken: token
    // });
    res.send(JSON.stringify({ token: token }))
})

app.listen(8080, () => {
    console.log("Server started on port 8080")
})

// module.exports = {spotifyApi};