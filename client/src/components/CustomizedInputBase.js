import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

export default function CustomizedInputBase(props) {
  return (
    <Paper
      component="form"
      sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Spotify Playlist URL"
        inputProps={{ 'aria-label': 'search playlist URL' }}
        onChange={props.onChange}
      />
      <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={props.onSubmit}>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}
