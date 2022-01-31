import React from 'react';
import {
    Image, ImageRequireSource
} from 'react-native';
import { Coordinate, Overlay } from 'react-native-maps';

interface IProps {
    image: ImageRequireSource;
    topLeft: Coordinate;
    width: number;
    height: number;
}

interface IState {
    rotatedImage: string;
    bounds: [Coordinate, Coordinate];
}

export default class FloorplanOverlay extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    const imageURI = Image.resolveAssetSource(this.props.image).uri;
    const EARTH_RADIUS = 6378;
    this.state = {
        rotatedImage: imageURI,
        bounds: [
            this.props.topLeft,
            [
                this.props.topLeft[0] - ((this.props.height / 1000) / EARTH_RADIUS) * (180 / Math.PI),
                this.props.topLeft[1] + ((this.props.width / 1000) / EARTH_RADIUS) * (180 / Math.PI) / Math.cos(this.props.topLeft[0] * Math.PI / 180)
            ]
        ]
    };
  }

  render() {
    return (
        <Overlay
            image={{uri: this.state.rotatedImage}}
            bounds={this.state.bounds}
        />
    );
  }
}
