import CustomizedForm from "./CustomizedForm";
import SearchIcon from "@mui/icons-material/Search";

export default function PlaylistSearchBar(props) {
	return (
		<div style={{ position: 'relative', top: props.hasPlaylist ? "5vh" : "30vh" }}>
			<CustomizedForm onSubmit={props.onSubmit}
				onChange={props.onChange}
				icon={<SearchIcon />}
				placeholder={"Spotify Playlist URL"}
			/>
		</div>)
}