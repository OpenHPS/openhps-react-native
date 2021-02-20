import {
    SourceNode,
    IMUDataFrame,
    SensorSourceOptions,
    Acceleration,
    Orientation,
    AngularVelocity,
    Quaternion,
    Magnetism
} from '@openhps/core';
import { 
    accelerometer, 
    gyroscope, 
    setUpdateIntervalForType, 
    SensorTypes, 
    magnetometer, 
    SensorData,
    orientation,
    OrientationData
} from 'react-native-sensors';
import { Subscription } from 'rxjs';

/**
 * IMU source node using react-native-sensors.
 */
export class IMUSourceNode extends SourceNode<IMUDataFrame> {
    protected options: SensorSourceOptions;
    private _subscriptionAcc: Subscription;
    private _subscriptionGyro: Subscription;
    private _subscriptionMag: Subscription;
    private _subscriptionRot: Subscription;
    private _lastPush = 0;
    private _rotation: OrientationData;
    private _magnetometer: SensorData;
    private _rotationRate: SensorData;
    private _acceleration: SensorData;

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
            setUpdateIntervalForType(SensorTypes.orientation, this.options.interval);

            this._subscriptionRot = orientation.subscribe((rotation) => {
                this._rotation = rotation;
                if (
                    this._lastPush < rotation.timestamp &&
                    this._acceleration !== undefined &&
                    this._rotationRate !== undefined &&
                    this._magnetometer !== undefined
                ) {
                    this._lastPush = rotation.timestamp;
                    this.createFrame();
                }
            });
            this._subscriptionMag = magnetometer.subscribe((magnetometer) => {
                this._magnetometer = magnetometer;
                if (
                    this._lastPush < magnetometer.timestamp &&
                    this._acceleration !== undefined &&
                    this._rotationRate !== undefined &&
                    this._rotationRate !== undefined
                ) {
                    this._lastPush = magnetometer.timestamp;
                    this.createFrame();
                }
            });
            this._subscriptionGyro = gyroscope.subscribe((rotationRate) => {
                this._rotationRate = rotationRate;
                if (
                    this._lastPush < rotationRate.timestamp &&
                    this._acceleration !== undefined &&
                    this._magnetometer !== undefined &&
                    this._rotationRate !== undefined
                ) {
                    this._lastPush = rotationRate.timestamp;
                    this.createFrame();
                }
            });
            this._subscriptionAcc = accelerometer.subscribe((acceleration) => {
                this._acceleration = acceleration;
                if (
                    this._lastPush < acceleration.timestamp &&
                    this._magnetometer !== undefined &&
                    this._rotationRate !== undefined &&
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
            this._subscriptionRot.unsubscribe();
            resolve();
        });
    }

    public createFrame(): Promise<void> {
        return new Promise<void>((resolve) => {
            const dataFrame = new IMUDataFrame();

            dataFrame.acceleration = new Acceleration(
                this._acceleration.x,
                this._acceleration.y,
                this._acceleration.z,
            );
            dataFrame.absoluteOrientation = Orientation.fromQuaternion(new Quaternion(
                this._rotation.qx,
                this._rotation.qy,
                this._rotation.qz,
                this._rotation.qw
            ));
            dataFrame.angularVelocity = new AngularVelocity(
                this._rotationRate.x,
                this._rotationRate.y,
                this._rotationRate.z,
            );
            dataFrame.magnetism = new Magnetism(
                this._magnetometer.x,
                this._magnetometer.y,
                this._magnetometer.z
            );

            dataFrame.frequency = 1 / this.options.interval;
            dataFrame.source = this.source;

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
