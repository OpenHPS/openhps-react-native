import React from 'react';
import {
  Dimensions,
} from 'react-native';
import {
  Container,
  Tab,
  Tabs,
  DefaultTabBar
} from 'native-base';
import Header from '../components/Header';
import MapTab from './MapTab';
import App from '../App';

const datapoints = require('./datapoints.json');
const testdatapoints = require('./testdatapoints.json');

declare module "native-base" {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export class DefaultTabBar extends React.Component<any, any> {}
}


interface IProps {
  app: App;
}

interface IState {

}

export default class MainPage extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
  }

  renderTabBar(props: any) {
    props.tabStyle = Object.create(props.tabStyle);
    return <DefaultTabBar {...props} />;
  }

  render() {
    return (
      <Container>
        <Header title={"OpenHPS"} hasTabs={true}/>
        <Tabs renderTabBar={this.renderTabBar}>
            <Tab heading="Train" tabStyle={{ /* ... */ }}>
                <MapTab
                    app={this.props.app}
                    datapointsJson={datapoints}
                />
            </Tab>
            <Tab heading="Test" tabStyle={{ /* ... */ }}>
                <MapTab
                    app={this.props.app}
                    datapointsJson={testdatapoints}
                />
            </Tab>
            <Tab heading="Trajectory" tabStyle={{ /* ... */ }}>
                <MapTab
                    app={this.props.app}
                    datapointsJson={datapoints}
                    trajectory={true}
                />
            </Tab>
        </Tabs>
      </Container>
    );
  }
}
