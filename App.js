import './style.css'

import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import { TypeAnimation } from 'react-type-animation'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'

function App() {
  new Map({
    layers: [new TileLayer({ source: new OSM() })],
    view: new View({
      center: [0, 0],
      zoom: 2,
    }),
    target: 'map',
  })

  return (
    <div className="App">
      <Box sx={{ width: '100%', maxWidth: 500 }}>
        <h1>panda.</h1>
        <h5>carbon capture registry project that uses immutable smart contracts and satelittes</h5>

        <TypeAnimation
          // Same String at the start will only be typed once, initially
          sequence={[
            'Earth needs you',
            1000,
            'Earth needs your farm',
            1000,
            'Earth needs you to monetize',
            1000,
            'Earth needs you to save it',
            1000,
          ]}
          speed={50} // Custom Speed from 1-99 - Default Speed: 40
          style={{ fontSize: '2em' }}
          wrapper="span" // Animation will be rendered as a <span>
          repeat={Infinity} // Repeat this Animation Sequence infinitely
        />
      </Box>
      <Drawer
            variant="persistent"
            anchor="right"
            open={true}
            onClose={null}
            sx={{
              width: 250,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 250,
              },
            }}
          >
            Carbon Capture Projects Capture Ability(Realtime)
            <Divider />
        <List>
          {['Karura Project', 'Mangrove forest', 'Oloolua Forest', 'Garden'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                {/* <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon> */}
                <ListItemText primary={text} />
                <ListItemText primary={index} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        Total
          </Drawer>

      <div style={{height:'600px',width:'800px', margin: 0, top: 180}}  id="map"></div>
    </div>
  )
}

export default App
