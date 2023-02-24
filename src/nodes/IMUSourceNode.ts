import {
    SourceNode,
    SensorSourceOptions,
    Acceleration,
    Orientation,
    AngularVelocity,
    Quaternion,
    Magnetism,
    DataFrame,
    Accelerometer,
    AbsoluteOrientationSensor,
    SensorObject,
    Gyroscope,
    Magnetometer,
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
export class IMUSourceNode extends SourceNode<DataFrame> {
    protected options: IMUSourceNodeOptions;
    private _subscriptions: Map<new () => SensorObject, Subscription> = new Map();
    private _values: Map<new () => SensorObject, any> = new Map();
    private _lastPush = 0;
    private _running = false;

    constructor(options?: IMUSourceNodeOptions) {
        super(options);
        this.options.interval = this.options.interval || 50;
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

            this.options.sensors.forEach((sensor: new () => SensorObject) => {
                setUpdateIntervalForType(this.findSensorName(sensor), this.options.interval);
                const sensorInstance = this.findSensorInstance(sensor);
                const subscription = sensorInstance.subscribe((value: any) => {
                    if (!this._running) return;
                    this._values.set(sensor, value);
                    if (this._isUpdated()) {
                        this._lastPush = value.timestamp;
                        this.createFrame().catch((ex) => {
                            this.logger('error', 'Unable to create frame!', ex);
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
            const dataFrame = new DataFrame();
            dataFrame.source = this.source;

            const acceleration: SensorData = this._values.get(Accelerometer);
            const magnetometer: SensorData = this._values.get(Magnetometer);
            const rotationRate: SensorData = this._values.get(Gyroscope);
            const orientation: OrientationData = this._values.get(AbsoluteOrientationSensor);

            if (acceleration) {
                dataFrame.addSensor(
                    new Accelerometer(
                        this.uid + '_accl',
                        new Acceleration(acceleration.x, acceleration.y, acceleration.z),
                    ),
                );
            }
            if (orientation) {
                dataFrame.addSensor(
                    new AbsoluteOrientationSensor(
                        this.uid + '_absoluteorientation',
                        Orientation.fromQuaternion(
                            new Quaternion(orientation.qx, orientation.qy, orientation.qz, orientation.qw),
                        ),
                    ),
                );
            }
            if (rotationRate) {
                dataFrame.addSensor(
                    new Gyroscope(
                        this.uid + '_gyro',
                        new AngularVelocity(rotationRate.x, rotationRate.y, rotationRate.z),
                    ),
                );
            }
            if (magnetometer) {
                dataFrame.addSensor(
                    new Magnetometer(
                        this.uid + '_magnetometer',
                        new Magnetism(magnetometer.x, magnetometer.y, magnetometer.z),
                    ),
                );
            }

            dataFrame
                .getObjects()
                .filter((s) => s instanceof SensorObject)
                .forEach((sensor: SensorObject) => {
                    sensor.frequency = 1000 / this.options.interval;
                });

            this.push(dataFrame);
            resolve();
        });
    }

    public onPull(): Promise<DataFrame> {
        return new Promise<DataFrame>((resolve) => {
            resolve(undefined);
        });
    }

    protected findSensorName(sensor: new () => SensorObject): string {
        switch (sensor) {
            case AbsoluteOrientationSensor:
                return 'orientation';
            case Magnetometer:
                return 'magnetometer';
            case Accelerometer:
                return 'accelerometer';
            case Gyroscope:
                return 'gyroscope';
            default:
                return undefined;
        }
    }

    protected findSensorInstance(sensor: new () => SensorObject): any {
        switch (sensor) {
            case AbsoluteOrientationSensor:
                return orientation;
            case Magnetometer:
                return magnetometer;
            case Accelerometer:
                return accelerometer;
            case Gyroscope:
                return gyroscope;
            default:
                return undefined;
        }
    }
}

export interface IMUSourceNodeOptions extends SensorSourceOptions {
    sensors: (new () => SensorObject)[];
    softStop?: boolean;
}
