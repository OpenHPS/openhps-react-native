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
    setUpdateIntervalForType,
    magnetometer,
    SensorData,
    orientation,
    OrientationData,
} from 'react-native-sensors';
import { Subscription } from 'rxjs';

/**
 * IMU source node using react-native-sensors.
 */
export class IMUSourceNode extends SourceNode<IMUDataFrame> {
    protected options: IMUSourceNodeOptions;
    private _subscriptions: Map<Sensor, Subscription> = new Map();
    private _values: Map<Sensor, any> = new Map();
    private _lastPush = 0;

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
            this.options.sensors.forEach((sensor) => {
                setUpdateIntervalForType(sensor, this.options.interval);
                const sensorInstance = this.findSensorInstance(sensor);
                const subscription = sensorInstance.subscribe((value: any) => {
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
            this._subscriptions.forEach((value) => value.unsubscribe());
            this._subscriptions = new Map();
            this._values = new Map();
            resolve();
        });
    }

    public createFrame(): Promise<void> {
        return new Promise<void>((resolve) => {
            const dataFrame = new IMUDataFrame();
            dataFrame.source = this.source;

            const acceleration: SensorData = this._values.get('accelerometer');
            const magnetometer: SensorData = this._values.get('magnetometer');
            const rotationRate: SensorData = this._values.get('gyroscope');
            const orientation: OrientationData = this._values.get('orientation');

            if (acceleration) {
                dataFrame.acceleration = new Acceleration(acceleration.x, acceleration.y, acceleration.z);
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

            dataFrame.frequency = 1 / this.options.interval;

            this.push(dataFrame);
            resolve();
        });
    }

    public onPull(): Promise<IMUDataFrame> {
        return new Promise<IMUDataFrame>((resolve) => {
            resolve(undefined);
        });
    }

    protected findSensorInstance(sensor: Sensor): any {
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
    sensors: Sensor[];
}

type Sensor = 'accelerometer' | 'magnetometer' | 'orientation' | 'gyroscope';
