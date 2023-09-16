import PlaylistNameField from "../CustomizedForm/PlaylistNameField";
import PlaylistCard from "./PlaylistCard";

export default function PlaylistInfo (props) {
	return(
		<>
              <PlaylistCard
                name={props.playlist.name}
                no_of_songs={props.playlistTracks.length}
                images={props.playlist.images}
                uid={props.playlist.id}
                isLoading={props.isLoading}
                onCancel={() => {
                  props.setPlaylist(undefined);
                  props.setPlaylistTracks(undefined);
                }}
              />
              <PlaylistNameField
                musicKit={props.musicKit}
                playlistName={props.playlistName}
                setPlaylistName={props.setPlaylistName}
                playlist={props.playlist}
                playlistTracks={props.playlistTracks}
              />
            </>
	)
}