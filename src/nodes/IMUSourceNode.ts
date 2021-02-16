import {
    SourceNode,
    IMUDataFrame,
    SensorSourceOptions,
    Acceleration,
    Orientation,
    AngularVelocity,
    RelativeValue,
    Euler,
} from '@openhps/core';
import { accelerometer, gyroscope, setUpdateIntervalForType, SensorTypes, magnetometer } from 'react-native-sensors';
import { Subscription } from 'rxjs';
import { Platform } from 'react-native';

/**
 * IMU source node using react-native-sensors.
 */
export class IMUSourceNode extends SourceNode<IMUDataFrame> {
    protected options: SensorSourceOptions;
    private _subscriptionAcc: Subscription;
    private _subscriptionGyro: Subscription;
    private _subscriptionMag: Subscription;
    private _lastPush = 0;
    private _rotation: any;
    private _rotationRate: any;
    private _acceleration: any;

    constructor(options?: SensorSourceOptions) {
        super(options);
        this.options.interval = this.options.interval || 100;
        if (this.options.autoStart) {
            this.once('build', this.start.bind(this));
        }
        this.once('destroy', this.stop.bind(this));
    }

    public start(): Promise<void> {
        return new Promise<void>((resolve) => {
            setUpdateIntervalForType(SensorTypes.accelerometer, this.options.interval);
            setUpdateIntervalForType(SensorTypes.gyroscope, this.options.interval);
            setUpdateIntervalForType(SensorTypes.magnetometer, this.options.interval);
            this._subscriptionMag = magnetometer.subscribe((rotation) => {
                this._rotation = rotation;
                if (
                    this._lastPush < rotation.timestamp &&
                    this._acceleration !== undefined &&
                    this._rotationRate !== undefined
                ) {
                    this._lastPush = rotation.timestamp;
                    this.createFrame();
                }
            });
            this._subscriptionGyro = gyroscope.subscribe((rotationRate) => {
                this._rotationRate = rotationRate;
                if (
                    this._lastPush < rotationRate.timestamp &&
                    this._acceleration !== undefined &&
                    this._rotation !== undefined
                ) {
                    this._lastPush = rotationRate.timestamp;
                    this.createFrame();
                }
            });
            this._subscriptionAcc = accelerometer.subscribe((acceleration) => {
                this._acceleration = acceleration;
                if (
                    this._lastPush < acceleration.timestamp &&
                    this._rotation !== undefined &&
                    this._rotationRate !== undefined
                ) {
                    this._lastPush = acceleration.timestamp;
                    this.createFrame();
                }
            });
            resolve();
        });
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            this._subscriptionAcc.unsubscribe();
            this._subscriptionGyro.unsubscribe();
            this._subscriptionMag.unsubscribe();
            resolve();
        });
    }

    public createFrame(): Promise<void> {
        return new Promise<void>((resolve) => {
            const dataFrame = new IMUDataFrame();

            if (Platform.OS === 'android') {
                dataFrame.acceleration = new Acceleration(
                    this._acceleration.x / 9.81,
                    this._acceleration.y / 9.81,
                    this._acceleration.z / 9.81,
                );
            } else {
                dataFrame.acceleration = new Acceleration(
                    this._acceleration.x,
                    this._acceleration.y,
                    this._acceleration.z,
                );
            }

            dataFrame.absoluteOrientation = Orientation.fromEuler(
                new Euler(this._rotation.x, this._rotation.y, this._rotation.z),
            );
            dataFrame.angularVelocity = new AngularVelocity(
                this._rotationRate.x,
                this._rotationRate.y,
                this._rotationRate.z,
            );

            dataFrame.frequency = 1 / this.options.interval;
            dataFrame.source = this.source;

            dataFrame.source.addRelativePosition(new RelativeValue('MAG_X', this._rotation.x));
            dataFrame.source.addRelativePosition(new RelativeValue('MAG_Y', this._rotation.y));
            dataFrame.source.addRelativePosition(new RelativeValue('MAG_Z', this._rotation.z));

            this.push(dataFrame);
            resolve();
        });
    }

    public onPull(): Promise<IMUDataFrame> {
        return new Promise<IMUDataFrame>((resolve) => {
            resolve(undefined);
        });
    }
}
