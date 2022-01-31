import React from 'react';
import {
  Dimensions,
  StyleSheet,
} from 'react-native';
import {
  Container
} from 'native-base';
import MapView, { MAP_TYPES } from 'react-native-maps';
import FloorplanOverlay from '../components/FloorplanOverlay';
import DatapointsOverlay from '../components/DatapointsOverlay';
import TrajectoryOverlay from '../components/TrajectoryOverlay';

const imgPleinlaan = require('./pleinlaan9.png');

import { Datapoint } from '../models/Datapoint';
import App from '../App';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.001;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const WIDTH = 46.275;
const HEIGHT = 37.27;
const SCALE = 4;  

interface IProps {
  app: App;
  datapointsJson: any[];
  trajectory?: boolean;
}

interface IState {
  datapoints: Datapoint[];
}

export default class MapTab extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = {
      datapoints: this.props.datapointsJson.map(d => new Datapoint(
        d.x, 
        d.y,
        [0, 0],
        WIDTH, 
        HEIGHT,
        SCALE))
    };
  }

  overlay() {
    if (this.props.trajectory) {
      return <TrajectoryOverlay
        datapoints={this.state.datapoints}
        scale={SCALE}
        app={this.props.app}
      />
    } else {
      return <DatapointsOverlay
        datapoints={this.state.datapoints}
        scale={SCALE}
        app={this.props.app}
      />
    }
  }
  render() {
    return (
      <Container>
        <MapView
          style={{
            backgroundColor: "#fff",
            ...StyleSheet.absoluteFillObject
          }}
          region={{
            latitude: 0,
            longitude: 0,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          mapType={MAP_TYPES.NONE}
          maxZoomLevel={30}
          minZoomLevel={19}
        >
          <FloorplanOverlay
            image={imgPleinlaan}
            topLeft={[0, 0]}
            width={WIDTH * SCALE}
            height={HEIGHT * SCALE}
          />
          {this.overlay()}
        </MapView>
      </Container>
    );
  }
}
