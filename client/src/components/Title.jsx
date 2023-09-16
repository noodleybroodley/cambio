export default function Title(props) {
	return (
		<>
			<div style={{
				top: props.hasPlaylist ? "0vh" : "25vh",
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
				top: props.hasPlaylist ? "0vh" : "25vh",
				position: 'relative',
				color: 'white',
				fontSize: '5vw',
				fontFamily: 'Hammersmith One',
				fontWeight: '400',
				wordWrap: 'break-word'
			}}>Transfer Spotify Playlists to Apple Music
			</div>
		</>
	)
}