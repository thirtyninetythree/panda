import Draw from 'ol/interaction/Draw'
import Map from 'ol/Map'
import Overlay from 'ol/Overlay'
import View from 'ol/View'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import { LineString, Polygon } from 'ol/geom'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { getArea, getLength } from 'ol/sphere'
import { unByKey } from 'ol/Observable'
import * as olProj from 'ol/proj'
import {useGeographic} from 'ol/proj';

import abi from "./abi.json"
import Web3 from 'web3'
import { UnsupportedChainIdError } from '@web3-react/core'

const raster = new TileLayer({
  source: new OSM(),
})

const source = new VectorSource()

const vector = new VectorLayer({
  source: source,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.2)',
    'stroke-color': '#ffcc33',
    'stroke-width': 2,
    'circle-radius': 7,
    'circle-fill-color': '#ffcc33',
  },
})

/**
 * Currently drawn feature.
 * @type {import("../src/ol/Feature.js").default}
 */
let sketch

/**
 * The help tooltip element.
 * @type {HTMLElement}
 */
let helpTooltipElement

/**
 * The help tooltip element.
 * @type {HTMLElement}
 */
let coordinates

/**
 * Overlay to show the help messages.
 * @type {Overlay}
 */
let helpTooltip

/**
 * The measure tooltip element.
 * @type {HTMLElement}
 */
let measureTooltipElement

/**
 * Overlay to show the measurement.
 * @type {Overlay}
 */
let measureTooltip

/**
 * Message to show when the user is drawing a polygon.
 * @type {string}
 */
const continuePolygonMsg = 'Click to continue drawing the polygon'

/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
const continueLineMsg = 'Click to continue drawing the line'

//to store user created polygon cooordinates
let coordinatesArray = []

/**
 * Handle pointer move.
 * @param {import("../src/ol/MapBrowserEvent").default} evt The event.
 */
const pointerMoveHandler = function (evt) {
  if (evt.dragging) {
    return
  }
  /** @type {string} */
  let helpMsg = 'Click to start drawing'

  if (sketch) {
    const geom = sketch.getGeometry()
    if (geom instanceof Polygon) {
      helpMsg = continuePolygonMsg
    } else if (geom instanceof LineString) {
      helpMsg = continueLineMsg
    }
  }

  helpTooltipElement.innerHTML = helpMsg
  helpTooltip.setPosition(evt.coordinate)

  helpTooltipElement.classList.remove('hidden')
}
useGeographic();

const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [121.1867, 37.6739],
    zoom: 2,
  }),
})

map.on('pointermove', pointerMoveHandler)

map.getViewport().addEventListener('mouseout', function () {
  helpTooltipElement.classList.add('hidden')
})

const typeSelect = document.getElementById('type')

let draw // global so we can remove it later

/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */
const formatLength = function (line) {
  const length = getLength(line)
  let output
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km'
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm'
  }
  return output
}

/**
 * Format area output.
 * @param {Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
const formatArea = function (polygon) {
  const area = getArea(polygon)
  let output
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>'
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>'
  }
  return output
}

function addInteraction() {
  const type = typeSelect.value == 'area' ? 'Polygon' : 'LineString'
  draw = new Draw({
    source: source,
    type: type,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2,
      }),
      image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.7)',
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
      }),
    }),
  })
  map.addInteraction(draw)

  createMeasureTooltip()
  createHelpTooltip()

  let listener
  draw.on('drawstart', function (evt) {
    // set sketch
    sketch = evt.feature

    /** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */
    let tooltipCoord = evt.coordinate
    // console.log(tooltipCoord)

    listener = sketch.getGeometry().on('change', function (evt) {
      const geom = evt.target
      let output

      if (geom instanceof Polygon) {
        output = formatArea(geom)
        tooltipCoord = geom.getInteriorPoint().getCoordinates()
      } else if (geom instanceof LineString) {
        output = formatLength(geom)
        tooltipCoord = geom.getLastCoordinate()
      }

      measureTooltipElement.innerHTML = output
      measureTooltip.setPosition(tooltipCoord)
    })
  })

  draw.on('drawend', function (evt) {
    const geom = evt.feature.getGeometry()
    const tooltipCoord = geom.getCoordinates()

    tooltipCoord[0].map((coordPair) => {
      var lonlat = olProj.toLonLat(coordPair, 'EPSG:3857')
      coordinatesArray.push(lonlat)
    })
    console.log(coordinatesArray)

    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static'
    measureTooltip.setOffset([0, -7])
    // unset sketch
    sketch = null
    // unset tooltip so that a new one can be created
    measureTooltipElement = null
    createMeasureTooltip()
    unByKey(listener)
  })
}

/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement)
  }
  helpTooltipElement = document.createElement('div')
  helpTooltipElement.className = 'ol-tooltip hidden'
  helpTooltip = new Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left',
  })
  map.addOverlay(helpTooltip)
}

/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement)
  }
  measureTooltipElement = document.createElement('div')
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure'
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
    stopEvent: false,
    insertFirst: false,
  })
  map.addOverlay(measureTooltip)
}

/**
 * Let user change the geometry type.
 */
typeSelect.onchange = function () {
  map.removeInteraction(draw)
  addInteraction()
}

addInteraction()

/**
 * Get polygon coordinates into smart contract
 * */

const API_KEY = '6e9140f0770d3c84709cd033b2918192'
let area = 0
document.getElementById('btn-mint').addEventListener('click', function () {
  const api_url = `http://api.agromonitoring.com/agro/1.0/polygons?appid=${API_KEY}&name=chainlink&geo_json=${coordinatesArray}`

  let ndvi_url = ""

  fetch(api_url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      area = data[0].area;
      setAreaInHectares(area)
      ndvi_url = `http://api.agromonitoring.com/agro/1.0/ndvi/history?start=1530336000&end=1534976000&polyid=${data[0].id}&appid=${API_KEY}`
      fetch(ndvi_url)
      .then((response) => response.json())
      // .then((_) => requestNVRI())
      .then((_) => calculateCarbonCreditFromNVRI())
      .then((_) => getCarbonCreditsAmount())
    })
}
)

document.getElementById('btn-connect').addEventListener('click',async function connect() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];
  connectedAccount = account;

  if (account) {
    document.getElementById("btn-connect").innerHTML = (account.substring(0, 6) + "...");
  } 
}
)
//CONTRACT INTERACTION
const contractAddress = "0x5e88469cBC070953086b035367C64E404Db6CE30";
let connectedAccount = "0x2Ed70fa3D40d6BFd2288f37c413386A7149eaBc2"
const web3 = new Web3(window.ethereum)
var contract = new web3.eth.Contract(abi, contractAddress)
contract.setProvider(window.ethereum)

window.addEventListener('load', (event) => {
  console.log("we've loaded")
  //populate proejct data onto page
  getNVRI()
});


//SEND FUNCTIONS
function requestNVRI() {
  contract.methods
    .requestNVRI
    .send({ from: connectedAccount})
    .on('transactionHash', function (hash) {
      console.log(hash)
    })
}

function setAreaInHectares(area) {
  area = area * 10 ** 5
  contract.methods
  .setAreaInHectares(area)
  .send({ from: connectedAccount})
  .on('transactionHash', function (hash) {
    console.log(hash)
  })
}
// tokens to mint
function calculateCarbonCreditFromNVRI() {
  contract.methods
  .calculateCarbonCreditFromNVRI()
  .send({ from: connectedAccount})
  .on('transactionHash', function (hash) {
    console.log(hash)
  })
}
// function mintCarbonTokens() {
//   contract.methods
//       .mint(carbon)
//       .send({ from: connectedAccount })
//       .then(function (result, error) {
//         console.log(`TOTAL SUPPLY ${result}`)
//         console.log(error)
//       })
// }

//CALL FUNCTIONS
function getNVRI() {
  contract.methods
    .getNVRI()
    .call({ from: connectedAccount })
    .then(function (result, error) {
      console.log(`CARBON SCORE ${result}`)
      console.log(error)
      document.getElementById("carbon-score").innerHTML = `${(result / (10 ** 16))} / 100`;
    })
}

function getCarbonCreditsAmount() {
  contract.methods
    .getCarbonCreditsAmount()
    .call({ from: connectedAccount })
    .then(function (result, error) {
      console.log(`CARBON CREDITS AMOUNT ${result}`)
      console.log(error)
      result = result / (10 ** 15)
      document.getElementById("carbon").innerHTML = `You are set to receive ${result} CARBON`;
    })
}
