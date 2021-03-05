import {
    SourceNode,
    IMUDataFrame,
    SensorSourceOptions,
    Acceleration,
    Orientation,
    AngularVelocity,
    Quaternion,
    Magnetism,
} from '@openhps/core';
import {
    accelerometer,
    gyroscope,
    setUpdateInterval,
    magnetometer,
    SensorData,
    orientation,
    OrientationData,
    SensorType,
    linearaccelerometer,
} from '../sensors';
import { Subscription } from 'rxjs';

/**
 * IMU source node using react-native-sensors.
 */
export class IMUSourceNode extends SourceNode<IMUDataFrame> {
    protected options: IMUSourceNodeOptions;
    private _subscriptions: Map<SensorType, Subscription> = new Map();
    private _values: Map<SensorType, any> = new Map();
    private _lastPush = 0;
    private _running = false;

    constructor(options?: IMUSourceNodeOptions) {
        super(options);
        this.options.interval = this.options.interval || 100;
        if (this.options.autoStart) {
            this.once('build', this.start.bind(this));
        }
        this.once('destroy', this.stop.bind(this));
    }

    public start(): Promise<void> {
        return new Promise<void>((resolve) => {
            this._running = true;
            if (this._subscriptions.size > 0) {
                return resolve();
            }

            this.options.sensors.forEach((sensor) => {
                setUpdateInterval(sensor, this.options.interval);
                const sensorInstance = this.findSensorInstance(sensor);
                const subscription = sensorInstance.subscribe((value: any) => {
                    if (!this._running) return;
                    this._values.set(sensor, value);
                    if (this._isUpdated()) {
                        this._lastPush = value.timestamp;
                        this.createFrame().catch((ex) => {
                            this.logger('error', ex);
                        });
                    }
                });
                this._subscriptions.set(sensor, subscription);
            });
            resolve();
        });
    }

    private _isUpdated(): boolean {
        return (
            Array.from(this._values.values()).filter((sensor) => sensor.timestamp > this._lastPush).length ===
            this.options.sensors.length
        );
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this.options.softStop) {
                this._running = false;
            } else {
                this._subscriptions.forEach((value) => value.unsubscribe());
                this._subscriptions = new Map();
                this._values = new Map();
            }
            resolve();
        });
    }

    public createFrame(): Promise<void> {
        return new Promise<void>((resolve) => {
            const dataFrame = new IMUDataFrame();
            dataFrame.source = this.source;

            const linearAcceleration: SensorData = this._values.get('linearaccelerometer');
            const acceleration: SensorData = this._values.get('accelerometer');
            const magnetometer: SensorData = this._values.get('magnetometer');
            const rotationRate: SensorData = this._values.get('gyroscope');
            const orientation: OrientationData = this._values.get('orientation');

            if (acceleration) {
                dataFrame.acceleration = new Acceleration(acceleration.x, acceleration.y, acceleration.z);
            }
            if (linearaccelerometer) {
<<<<<<< HEAD
                dataFrame.linearAcceleration = new Acceleration(
                    linearAcceleration.x,
                    linearAcceleration.y,
                    linearAcceleration.z,
                );
=======
                dataFrame.linearAcceleration = new Acceleration(linearAcceleration.x, linearAcceleration.y, linearAcceleration.z);
>>>>>>> a22e10891819bfd23294af9a1445b5b011a5dade
            }
            if (orientation) {
                dataFrame.absoluteOrientation = Orientation.fromQuaternion(
                    new Quaternion(orientation.qx, orientation.qy, orientation.qz, orientation.qw),
                );
            }
            if (rotationRate) {
                dataFrame.angularVelocity = new AngularVelocity(rotationRate.x, rotationRate.y, rotationRate.z);
            }
            if (magnetometer) {
                dataFrame.magnetism = new Magnetism(magnetometer.x, magnetometer.y, magnetometer.z);
            }

            dataFrame.frequency = 1000 / this.options.interval;

            this.push(dataFrame);
            resolve();
        });
    }

    public onPull(): Promise<IMUDataFrame> {
        return new Promise<IMUDataFrame>((resolve) => {
            resolve(undefined);
        });
    }

    protected findSensorInstance(sensor: SensorType): any {
        switch (sensor) {
            case 'orientation':
                return orientation;
            case 'magnetometer':
                return magnetometer;
            case 'accelerometer':
                return accelerometer;
            case 'gyroscope':
                return gyroscope;
            default:
                return undefined;
        }
    }
}

export interface IMUSourceNodeOptions extends SensorSourceOptions {
    sensors: SensorType[];
    softStop?: boolean;
}
