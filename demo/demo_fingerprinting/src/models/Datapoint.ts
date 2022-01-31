import { Coordinate, LatLng, Marker } from "react-native-maps";

export class Datapoint {
    x: number;
    y: number;
    currentOrientation: number = 0;
    status: number;
    marker: Marker;
    private _width: number;
    private _height: number;
    private _scale: number;
    private _topLeft: Coordinate;

    constructor(x: number, y: number, topLeft: Coordinate, width: number, height: number, scale: number) {
        this.x = x;
        this.y = y;
        this._topLeft = topLeft;
        this.status = 0;
        this._width = width;
        this._height = height;
        this._scale = scale;
    }
    
    get coord(): LatLng {
        const EARTH_RADIUS = 6378;
        return {
            latitude: this._topLeft[0] - ((((this._height * this._scale) - (this.y * this._scale)) / 1000) / EARTH_RADIUS) * (180 / Math.PI),
            longitude: this._topLeft[1] + (((this.x * this._scale) / 1000) / EARTH_RADIUS) * (180 / Math.PI) / Math.cos(this._topLeft[0] * Math.PI / 180)
        };
    }
}
