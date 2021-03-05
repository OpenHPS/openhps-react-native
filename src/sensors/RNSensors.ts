import { NativeModules } from 'react-native';
import { SensorType } from './SensorsBase';
const {
    Gyroscope: GyroNative,
    Accelerometer: AccNative,
    LinearAccelerometer: LinearAccNative,
    Magnetometer: MagnNative,
    Barometer: BarNative,
    Orientation: OrientNative,
} = NativeModules;

if (!GyroNative && !AccNative && !MagnNative && !BarNative && !OrientNative) {
    throw new Error('Native modules for sensors not available. Did react-native link run successfully?');
}

const nativeApis = new Map([
    ['accelerometer', AccNative],
    ['linearaccelerometer', LinearAccNative],
    ['gyroscope', GyroNative],
    ['magnetometer', MagnNative],
    ['barometer', BarNative],
    ['orientation', OrientNative],
]);

// Cache the availability of sensors
const availableSensors: any = {};

/**
 * @param type
 */
export function start(type: SensorType) {
    const api = nativeApis.get(type.toLocaleLowerCase());
    api.startUpdates();
}

/**
 * @param type
 */
export function isAvailable(type: SensorType) {
    if (availableSensors[type]) {
        return availableSensors[type];
    }

    const api = nativeApis.get(type.toLocaleLowerCase());
    const promise = api.isAvailable();
    availableSensors[type] = promise;
    return promise;
}

/**
 * @param type
 */
export function stop(type: SensorType) {
    const api = nativeApis.get(type.toLocaleLowerCase());
    api.stopUpdates();
}

/**
 * @param type
 * @param updateInterval
 */
export function setUpdateInterval(type: SensorType, updateInterval: number) {
    const api = nativeApis.get(type.toLocaleLowerCase());
    api.setUpdateInterval(updateInterval);
}

/**
 * @param type
 * @param level
 */
export function setLogLevelForType(type: SensorType, level: number) {
    const api = nativeApis.get(type.toLocaleLowerCase());
    api.setLogLevel(level);
}
