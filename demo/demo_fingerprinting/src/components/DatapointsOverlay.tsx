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

export default class DatapointsOverlay extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            datapoints: this.props.datapoints,
        };
    }

    componentDidMount() {
        const red = Icon.getImageSourceSync('upcircle', 25, '#f00000');
        const orange = Icon.getImageSourceSync('upcircle', 25, 'orange');
        const green = Icon.getImageSourceSync('checkcircle', 25, 'green');
        this.setState({
            datapoints: this.props.datapoints,
            red,
            green,
            orange
        });
    }

    onMarkerClick(datapoint) {
        Actions.push("datapoint", {
            datapoint, map: this, app: this.props.app
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
                            flat={datapoint.status === 2 ? false : true}
                            image={datapoint.status === 0 ? this.state.red : (
                                datapoint.status === 1 ? this.state.orange : this.state.green
                            )}
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
