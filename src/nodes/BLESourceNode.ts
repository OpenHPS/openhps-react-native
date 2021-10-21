import { DataFrame, SourceNode, SensorSourceOptions } from '@openhps/core';
import { BleManager, Device, ScanMode, ScanCallbackType } from 'react-native-ble-plx';
import { RFTransmitterObject, RelativeRSSI } from '@openhps/rf';

/**
 * BLE source node using react-native-ble-plx.
 */
export class BLESourceNode extends SourceNode<DataFrame> {
    private _manager: BleManager;
    protected options: BLESourceNodeOptions;

    constructor(options?: BLESourceNodeOptions) {
        super(options);
        this.options.uuids = this.options.uuids || null;
        this.once('build', this._onBleInit.bind(this));
        this.once('destroy', this.stop.bind(this));
    }

    private _onBleInit(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._manager = new BleManager();
            this._manager.onStateChange((state) => {
                if (state === 'PoweredOn') {
                    if (this.options.autoStart) {
                        this.start().then(resolve).catch(reject);
                    } else {
                        resolve();
                    }
                } else {
                    reject(state);
                }
            }, true);
        });
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            this._manager.stopDeviceScan();
            resolve();
        });
    }

    public start(): Promise<void> {
        return new Promise((resolve) => {
            this._manager.stopDeviceScan();
            this._manager.startDeviceScan(
                this.options.uuids,
                {
                    allowDuplicates: true,
                    scanMode: ScanMode.LowLatency,
                    callbackType: ScanCallbackType.AllMatches,
                },
                (error: any, device: Device) => {
                    if (error) {
                        this.logger('error', error);
                        return;
                    }

                    const frame = new DataFrame();
                    const beacon = new RFTransmitterObject(device.id);
                    beacon.displayName = device.localName;
                    beacon.txPower = device.txPowerLevel;
                    frame.addObject(beacon);

                    frame.source = this.source;
                    frame.source.relativePositions.forEach((pos) =>
                        frame.source.removeRelativePositions(pos.referenceObjectUID),
                    );
                    frame.source.addRelativePosition(new RelativeRSSI(beacon, device.rssi));
                    this.push(frame);
                },
            );
            resolve();
        });
    }

    public onPull(): Promise<DataFrame> {
        return new Promise<DataFrame>((resolve) => {
            resolve(undefined);
        });
    }
}

export interface BLESourceNodeOptions extends SensorSourceOptions {
    /**
     * List of UUIDs that should be included in the result scan.
     */
    uuids?: string[];
}
