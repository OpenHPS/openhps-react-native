import { NativeEventEmitter, NativeModules } from 'react-native';
import { Observable } from 'rxjs';
import { publish, refCount } from 'rxjs/operators';
import * as RNSensors from './RNSensors';

const {
    Gyroscope: GyroNative,
    Accelerometer: AccNative,
    LinearAccelerometer: LinearAccNative,
    Magnetometer: MagnNative,
    Barometer: BarNative,
    Orientation: OrientNative,
} = NativeModules;

const listenerKeys = new Map([
    ['accelerometer', 'Accelerometer'],
    ['linearaccelerometer', 'LinearAccelerometer'],
    ['gyroscope', 'Gyroscope'],
    ['magnetometer', 'Magnetometer'],
    ['barometer', 'Barometer'],
    ['orientation', 'Orientation'],
]);

const nativeApis = new Map([
    ['linearaccelerometer', LinearAccNative],
    ['accelerometer', AccNative],
    ['gyroscope', GyroNative],
    ['magnetometer', MagnNative],
    ['barometer', BarNative],
    ['orientation', OrientNative],
]);

const eventEmitterSubscription = new Map([
    ['linearaccelerometer', null],
    ['accelerometer', null],
    ['gyroscope', null],
    ['magnetometer', null],
    ['barometer', null],
    ['orientation', null],
]);

/**
 * @param sensorType
 */
function createSensorObservable(sensorType: any) {
    return Observable.create(function subscribe(observer: any) {
        this.isSensorAvailable = false;

        this.unsubscribeCallback = () => {
            if (!this.isSensorAvailable) return;
            if (eventEmitterSubscription.get(sensorType)) eventEmitterSubscription.get(sensorType).remove();
            // stop the sensor
            RNSensors.stop(sensorType);
        };

        RNSensors.isAvailable(sensorType).then(
            () => {
                this.isSensorAvailable = true;

                const emitter = new NativeEventEmitter(nativeApis.get(sensorType));

                eventEmitterSubscription.set(
                    sensorType,
                    emitter.addListener(listenerKeys.get(sensorType), (data) => {
                        observer.next(data);
                    }),
                );

                // Start the sensor manager
                RNSensors.start(sensorType);
            },
            () => {
                observer.error(`Sensor ${sensorType} is not available`);
            },
        );

        return this.unsubscribeCallback;
    }).pipe(makeSingleton());
}

// As we only have one sensor we need to share it between the different consumers
/**
 *
 */
function makeSingleton() {
    return (source: any) => source.pipe(publish(), refCount());
}

const accelerometer = createSensorObservable('accelerometer');
const linearaccelerometer = createSensorObservable('linearaccelerometer');
const gyroscope = createSensorObservable('gyroscope');
const magnetometer = createSensorObservable('magnetometer');
const barometer = createSensorObservable('barometer');
const orientation = createSensorObservable('orientation');

export { gyroscope, accelerometer, linearaccelerometer, magnetometer, barometer, orientation };
