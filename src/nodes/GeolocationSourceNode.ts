import { DataFrame, SourceNode, GeographicalPosition, SensorSourceOptions } from '@openhps/core';
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
                    const geoPos = new GeographicalPosition();
                    geoPos.accuracy = position.coords.accuracy;
                    geoPos.altitude = position.coords.altitude;
                    geoPos.latitude = position.coords.latitude;
                    geoPos.longitude = position.coords.longitude;
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

    public stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            Geolocation.clearWatch(this._watchId);
            resolve();
        });
    }

    public onPull(): Promise<DataFrame> {
        return new Promise<DataFrame>((resolve) => {
            resolve(undefined);
        });
    }
}

export interface GeolocationSourceOptions extends SensorSourceOptions {
    distanceFilter?: number;
}
