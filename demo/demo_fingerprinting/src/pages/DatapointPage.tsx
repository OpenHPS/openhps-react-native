import React from 'react';
import {
  Button,
  Container,
  Content,
  Text
} from 'native-base';
import { Datapoint } from '../models/Datapoint';
import DatapointsOverlay from '../components/DatapointsOverlay';
import Header from '../components/Header';
import App from '../App';
import { Absolute2DPosition, AngleUnit, Orientation } from '@openhps/core';

interface IProps {
    datapoint: Datapoint;
    map: DatapointsOverlay;
    app: App;
}

interface IState {
    scanning: boolean;
}

export default class DatapointPage extends React.Component<IProps, IState> {
  public static readonly SAMPLE_TIME: number = 20000; // Experiment
  
  constructor(props: IProps) {
    super(props);
    if (this.props.datapoint.currentOrientation !== 3) {
      this.props.datapoint.status = 1;
    }
    this.props.datapoint.marker.forceUpdate();
    this.props.map.forceUpdate();
    this.state = {
      scanning: false,
    };
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    this.props.app.offlineModel.removeAllListeners('frame');
  }

  scan() {
    this.setState({
      ...this.state,
      scanning: true,
    });

    const position = new Absolute2DPosition(
      this.props.datapoint.x,
      this.props.datapoint.y
    );
    position.orientation = Orientation.fromEuler({
      yaw: this.props.datapoint.currentOrientation * 90,
      pitch: 0,
      roll: 0,
      unit: AngleUnit.DEGREE
    });

    this.props.app.offlineModel.startRecording(position);
    setTimeout(() => {
      this.setState({
        ...this.state,
        scanning: false
      });
      this.props.app.offlineModel.stopRecording();
      if (this.props.datapoint.currentOrientation !== 3) {
        this.props.datapoint.currentOrientation += 1;
      } else {
        this.props.datapoint.currentOrientation = 0;
        this.props.datapoint.status = 2;
      }
      this.props.datapoint.marker.forceUpdate();
      this.props.map.forceUpdate();
      this.forceUpdate();
    }, DatapointPage.SAMPLE_TIME);
  }

  render() {
    return (
      <Container>
        <Header title={"Data point"}/>
        <Content 
          contentContainerStyle={{
            justifyContent: 'center',
            height: "100%", 
            alignItems: 'center', 
            paddingTop: 40, 
            backgroundColor: this.props.datapoint.status === 2 ? "green" : "orange",
            paddingHorizontal: 10}
        }>
          <Button
              onPress={() => this.scan()}
              disabled={this.state.scanning}
              large
              block
          >
            <Text>{this.state.scanning ? "Scanning (" + this.props.datapoint.currentOrientation + ") ..." : "Start scan (" + this.props.datapoint.currentOrientation + ")"}</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}
