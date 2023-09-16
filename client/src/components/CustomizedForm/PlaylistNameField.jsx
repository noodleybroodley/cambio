import CustomizedForm from "./CustomizedForm";
import { addToAppleLibrary} from '../../Apple/Apple-Helpers';
import { ArrowRight } from "@mui/icons-material";

export default function PlaylistNameField (props) {
	return(<div style={{ position: "relative", top: "15vh" }}>
	<CustomizedForm
	  style={{ display: "flex" }}
	  onSubmit={() => {
		props.musicKit.authorize().then(async (val) => {
		  let name = props.playlistName.length > 0 ? props.playlistName : props.playlist.name;
		  await addToAppleLibrary(props.playlistTracks, name, props.musicKit);
		})
	  }}
	  onChange={e => {
		let name = e.target.value;
		props.setPlaylistName(name);
	  }}
	  icon={<ArrowRight />}
	  placeholder={"New Playlist Name (or Press Enter)"}
	/>
  </div>)
}