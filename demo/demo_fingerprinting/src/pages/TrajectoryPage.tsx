import React from 'react';
import {
  Button,
  Container,
  Content,
  Text
} from 'native-base';
import { Datapoint } from '../models/Datapoint';
import Header from '../components/Header';
import App from '../App';
import { Absolute2DPosition } from '@openhps/core';

interface IProps {
    datapoint: Datapoint;
    app: App;
}

interface IState {
    scanning: boolean;
}

export default class TrajectoryPage extends React.Component<IProps, IState> {
  
  constructor(props: IProps) {
    super(props);
    if (this.props.datapoint.currentOrientation !== 3) {
      this.props.datapoint.status = 1;
    }
    this.state = {
      scanning: false,
    };
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    this.props.app.offlineModel.removeAllListeners('frame');
  }

  toggleScan() {
    if (this.state.scanning) {
      // stop scan
      this.setState({
        ...this.state,
        scanning: false
      });
      this.props.app.offlineModel.stopRecording();
    } else {
      // start scan
      this.setState({
        ...this.state,
        scanning: true,
      });
  
      const position = new Absolute2DPosition(
        this.props.datapoint.x,
        this.props.datapoint.y
      );
  
      this.props.app.offlineModel.startRecording(position);
    }
  }

  render() {
    return (
      <Container>
        <Header title={"Trajectory"}/>
        <Content 
          contentContainerStyle={{
            justifyContent: 'center',
            height: "100%", 
            alignItems: 'center', 
            paddingTop: 40, 
            backgroundColor: this.state.scanning ? "red" : "green",
            paddingHorizontal: 10}
        }>
          <Button
              onPress={() => this.toggleScan()}
              large
              block
          >
            <Text>{this.state.scanning ? "Stop" : "Start"}</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}
