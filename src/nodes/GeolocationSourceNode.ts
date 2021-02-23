import { DataFrame, SourceNode, GeographicalPosition, SensorSourceOptions } from '@openhps/core';
import * as Geolocation from 'react-native-geolocation-service';

/**
 * Geolocation source node using react-native-geolocation-service.
 */
export class GeolocationSourceNode extends SourceNode<DataFrame> {
    protected options: SensorSourceOptions;
    private _timer: number;

    constructor(options?: SensorSourceOptions) {
        super(options);
        this.options.interval = this.options.interval || 1000;
        if (this.options.autoStart) {
            this.once('build', this.start.bind(this));
        }
    }

    public start(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    const geoPos = new GeographicalPosition();
                    geoPos.accuracy = position.coords.accuracy;
                    geoPos.altitude = position.coords.altitude;
                    geoPos.latitude = position.coords.latitude;
                    geoPos.longitude = position.coords.longitude;
                    this.source.setPosition(geoPos);
                    const frame = new DataFrame(this.source);
                    this.push(frame);
                },
                (error) => {
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: this.options.interval },
            );
            resolve();
        });
    }

    public stopScan(): Promise<void> {
        return new Promise<void>((resolve) => {
            clearInterval(this._timer);
            resolve();
        });
    }

    public onPull(): Promise<DataFrame> {
        return new Promise<DataFrame>((resolve) => {
            resolve(undefined);
        });
    }
}
