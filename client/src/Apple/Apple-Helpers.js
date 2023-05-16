
export async function getMusicKitInstance() {
    const appleInstance = window.MusicKit;
    let musicKit;
    return fetch("/api/appleToken").then(response => response.json())
        .then(res => {
            console.log("Apple Music Dev Token: ", res);
            appleInstance.configure({
                developerToken: res.token,
                app: {
                    name: 'Playlist Converter',
                    build: '1978.4.1'
                }
            });
            musicKit = appleInstance.getInstance();
            console.log("Music Kit Instance: ", musicKit)
            return musicKit;
        })
        .catch((error) => {
            console.log(error)
        })
}