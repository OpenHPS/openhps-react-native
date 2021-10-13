import {
    DataFrame,
    SourceNode,
    GeographicalPosition,
    SensorSourceOptions,
    LinearVelocity,
    Orientation,
    AngleUnit,
} from '@openhps/core';
import * as Geolocation from 'react-native-geolocation-service';

/**
 * Geolocation source node using react-native-geolocation-service.
 */
export class GeolocationSourceNode extends SourceNode<DataFrame> {
    protected options: GeolocationSourceOptions;
    private _watchId: number;

    constructor(options?: SensorSourceOptions) {
        super(options);
        this.options.interval = this.options.interval || 1000;
        this.options.distanceFilter = this.options.distanceFilter || 1;
        if (this.options.autoStart) {
            this.once('build', this.start.bind(this));
        }
    }

    public start(): Promise<void> {
        return new Promise<void>((resolve) => {
            this._watchId = Geolocation.watchPosition(
                (position) => {
                    const geoPos = this._convertPosition(position);
                    this.source.setPosition(geoPos);
                    this.push(new DataFrame(this.source));
                },
                (error) => {
                    this.logger('error', error);
                },
                {
                    interval: this.options.interval,
                    enableHighAccuracy: true,
                    distanceFilter: this.options.distanceFilter,
                },
            );
            resolve();
        });
    }

    private _convertPosition(position: Geolocation.GeoPosition): GeographicalPosition {
        const geoPos = new GeographicalPosition();
        geoPos.accuracy = position.coords.accuracy;
        geoPos.altitude = position.coords.altitude;
        geoPos.latitude = position.coords.latitude;
        geoPos.longitude = position.coords.longitude;
        geoPos.linearVelocity = new LinearVelocity(position.coords.speed);
        geoPos.orientation = Orientation.fromEuler({
            yaw: position.coords.heading,
            pitch: 0,
            roll: 0,
            unit: AngleUnit.DEGREE,
        });
        return geoPos;
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            Geolocation.clearWatch(this._watchId);
            resolve();
        });
    }

    public onPull(): Promise<DataFrame> {
        return new Promise<DataFrame>((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    const geoPos = this._convertPosition(position);
                    this.source.setPosition(geoPos);
                    resolve(new DataFrame(this.source));
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    distanceFilter: this.options.distanceFilter,
                },
            );
        });
    }
}

export interface GeolocationSourceOptions extends SensorSourceOptions {
    distanceFilter?: number;
}
