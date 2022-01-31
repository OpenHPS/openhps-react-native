import { View } from 'native-base';
import React from 'react';
import { Marker } from 'react-native-maps';
import { Datapoint } from '../models/Datapoint';
import { Actions } from 'react-native-router-flux';
import App from '../App';
import Icon from 'react-native-vector-icons/AntDesign';

interface IProps {
    datapoints: Datapoint[];
    scale: number;
    app: App;
}

interface IState {
    datapoints: Datapoint[];
    red?: any;
    orange?: any;
    green?: any;
}

export default class TrajectoryOverlay extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            datapoints: this.props.datapoints,
        };
    }

    componentDidMount() {
        const green = Icon.getImageSourceSync('checkcircle', 25, 'green');
        this.setState({
            datapoints: this.props.datapoints,
            green
        });
    }

    onMarkerClick(datapoint) {
        Actions.push("trajectory", {
            datapoint, app: this.props.app
        });
    }

    render() {
        return (
            <View>
                {this.state.datapoints.map(datapoint => {
                    return (
                        <Marker
                            key={Math.random()}
                            ref={(ref) => datapoint.marker = ref}
                            coordinate={datapoint.coord}
                            anchor={{x: 0.5, y: 0.5}}
                            flat={false}
                            image={this.state.green}
                            rotation={
                                datapoint.currentOrientation * 90
                            }
                            onPress={() => this.onMarkerClick(datapoint)}
                        />
                    );
                })}
            </View>
        );
    }
}
