import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';

export default function CustomizedForm(props) {
  /** Customized Material UI Form Component
   *
   * Props:
   * onSubmit: ()=>void
   * onChange: (e)=>void
   * icon: Icon element*/
  const handleEnter = (e) => {
    e.preventDefault();
  }
  return (
    <Paper
      component="form"
      sx={{p: '2px 4px', display: 'flex', alignItems: 'center', width: 400, margin: 'auto'}}
    >
      <InputBase
        sx={{ml: 1, flex: 1}}
        placeholder={props.placeholder}
        inputProps={{'aria-label': 'search playlist URL'}}
        onChange={props.onChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleEnter(e);
            props.onSubmit();
          }
        }}/>
          <IconButton type="button" sx={{p: '10px'}} onClick={props.onSubmit}>
        {props.icon}
      </IconButton>
    </Paper>
  );
}
