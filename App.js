import './style.css'

import Box from '@mui/material/Box'

import { TypeAnimation } from 'react-type-animation';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

function App() {
  new Map({
    layers: [
      new TileLayer({source: new OSM()}),
    ],
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
         
          <TypeAnimation
            // Same String at the start will only be typed once, initially
            sequence={[
              'ReFi for the your farm.',
              1000,
              'Monetize your garden',
              1000,
              'Incentives for afforestation',
              1000,
              'Save the world',
              1000,
            ]}
            speed={50} // Custom Speed from 1-99 - Default Speed: 40
            style={{ fontSize: '2em' }}
            wrapper="span" // Animation will be rendered as a <span>
            repeat={Infinity} // Repeat this Animation Sequence infinitely
          />
        </Box>
        

        <div id="map"></div>
        
      
    </div>
  )
}

export default App
