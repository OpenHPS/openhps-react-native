import '../../shim.js';
import {
    ModelBuilder,
    DataObject,
    CallbackNode,
    DataSerializer,
    Model,
    AbsolutePosition,
    DataFrame,
    TimeUnit,
} from '@openhps/core';
import { BLESourceNode, WLANSourceNode, IMUSourceNode, SensorType } from '@openhps/react-native';
import DeviceInfo from 'react-native-device-info';
import { SocketClient, SocketClientSink } from '@openhps/socket';
import { self } from 'react-native-threads';

// Uniquely identify the device
const phoneUID = DeviceInfo.getUniqueId();

let recording: boolean = false;
let position: AbsolutePosition = undefined;
let model: Model;

self.postMessage(JSON.stringify({
    event: 'log',
    args: ["info", "Thread is started!"]
}));

self.onmessage = (message: string) => {
    const msg = JSON.parse(message);
    switch (msg.action) {
        /**
         * Initialize the positioning model
         */
        case "init":
            init();
            self.postMessage(JSON.stringify({
                event: msg.action,
                args: []
            }));
            break;
        /**
         * Connect to a remote server
         */
        case "connect":
            const service = model.findService(SocketClient);
            model.logger('debug', {
                message: "Connection request received to " + msg.url
            });
            service.connect({
                path: "/api/v1",
                url: msg.url
            }).then(() => {
                // We start the IMU sensor and stop it immediately
                // This is to flush the buffer of the sensor. You do not need to
                // do this for BLE/WLAN and only magenetometer data
                return (model.findNodeByName("imu-source") as IMUSourceNode).start();
            }).then(() => {
                (model.findNodeByName("imu-source") as IMUSourceNode).stop();
                self.postMessage(JSON.stringify({
                    event: msg.action,
                    args: [
                        true
                    ]
                }));
            }).catch(() => {
                self.postMessage(JSON.stringify({
                    event: msg.action,
                    args: [
                        false
                    ]
                }));
            });
            break;
        /**
         * Start recording data
         */
        case "startRecording":
            position = DataSerializer.deserialize(msg.position);
            recording = true;
            Promise.all([
                (model.findNodeByName("wlan-source") as WLANSourceNode).start(),
                //(model.findNodeByName("imu-source") as IMUSourceNode).start(),
                (model.findNodeByName("ble-source") as BLESourceNode).start()
            ]).then(() => {
                self.postMessage(JSON.stringify({
                    event: msg.action,
                    args: []
                }));
                model.logger('debug', {
                    message: "Started recording!"
                });
            }).catch(ex => {
                model.logger('error', ex);
            });
            break;
        /**
         * Stop recording data
         */
        case "stopRecording":
            recording = false;
            (model.findNodeByName("wlan-source") as WLANSourceNode).stop();
            //(model.findNodeByName("imu-source") as IMUSourceNode).stop();
            (model.findNodeByName("ble-source") as BLESourceNode).stop();
            self.postMessage(JSON.stringify({
                event: msg.action,
                args: []
            }));
            model.logger('debug', {
                message: "Stopped recording!"
            });
            break;
    }
};

function init() {
    ModelBuilder.create()
        .addService(new SocketClient())
        .withLogger((level: string, log: any) => {
            self.postMessage(JSON.stringify({
                event: 'log',
                args: [level, log]
            }));
        })
        .from(
            new WLANSourceNode({
                source: new DataObject(phoneUID + "_wlan"),
                name: "wlan-source",
                interval: 0,
                persistence: false,
            }),
            new IMUSourceNode({
                source: new DataObject(phoneUID + "_imu"),
                name: "imu-source",
                interval: 20, // 20ms for training
                persistence: false,
                softStop: true,
                sensors: [
                    SensorType.GYROSCOPE,
                    SensorType.ACCELEROMETER,
                    SensorType.ORIENTATION,
                    SensorType.MAGNETOMETER
                ]
            }),
            new BLESourceNode({
                source: new DataObject(phoneUID + "_ble"),
                name: "ble-source",
                persistence: false,
                uuids: ['0000ffe0-0000-1000-8000-00805f9b34fb']
            })
        )
        .filter(() => recording)
        .via(new CallbackNode((frame: DataFrame) => {
            frame.source.setPosition(position);
        }))
        // Create chunks of 250 frames before sending. Timeout and send frames (smaller than 250x) after 1000 ms
        // If you enable this. Make sure you have a ".flatten()" function on the server
        .chunk(250, 1000, TimeUnit.MILLISECOND)
        .to(new SocketClientSink({
            uid: "offline"
        }))
        .build().then(m => {
            model = m;
            model.logger('debug', {
                message: "Model build!"
            });
        }).catch(console.error);
}
