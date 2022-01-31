import 'react-native-get-random-values';
import React from 'react';
import '../shim.js';
import { Router, Scene } from 'react-native-router-flux';
import { OfflineModel } from './managers/OfflineModel';
import DatapointPage from './pages/DatapointPage';
import ConnectionPage from './pages/ConnectionPage';
import { PermissionsAndroid } from 'react-native';
import MainPage from './pages/MainPage';
import TrajectoryPage from './pages/TrajectoryPage';

interface IProps {

}

export default class App extends React.Component<IProps> {
  public offlineModel: OfflineModel;

  constructor(props: IProps) {
    super(props);
    this.offlineModel = new OfflineModel();
  }

  async componentDidMount() {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'OpenHPS',
        message: 'OpenHPS requires access to your location.',
        buttonPositive: 'Accept',
        buttonNeutral: 'Later',
        buttonNegative: 'Deny'
      }
    );
    this.offlineModel.init();
  }

  render() {
    return (
      <Router>
        <Scene key="root" hideNavBar={true}>
          <Scene key="connect" component={ConnectionPage} initial={true} app={this}/>
          <Scene key="map" component={MainPage}/>
          <Scene key="datapoint" component={DatapointPage}/>
          <Scene key="trajectory" component={TrajectoryPage}/>
        </Scene>
      </Router>
    );
  }
}
