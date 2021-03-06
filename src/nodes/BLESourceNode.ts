import { DataFrame, SourceNode, RFTransmitterObject, RelativeRSSIPosition, SensorSourceOptions } from '@openhps/core';
import { BleManager, Device, ScanMode } from 'react-native-ble-plx';

/**
 * BLE source node using react-native-ble-plx.
 */
export class BLESourceNode extends SourceNode<DataFrame> {
    private _manager: BleManager;
    private _timer: number;
    protected options: BLESourceNodeOptions;

    constructor(options?: BLESourceNodeOptions) {
        super(options);
        this.options.interval = this.options.interval || 100;
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

    public start(): Promise<void> {
        return new Promise((resolve) => {
            this._timer = setInterval(this._scan.bind(this), this.options.interval);
            resolve();
        });
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            clearInterval(this._timer);
            this._timer = undefined;
            this._manager.stopDeviceScan();
            resolve();
        });
    }

    private _scan(): void {
        this._manager.stopDeviceScan();
        this.source.relativePositions.forEach((relativePosition) => {
            this.source.removeRelativePositions(relativePosition.referenceObjectUID);
        });
        this._manager.startDeviceScan(
            this.options.uuids,
            {
                allowDuplicates: true,
                scanMode: ScanMode.LowLatency,
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
                frame.source.addRelativePosition(new RelativeRSSIPosition(beacon, device.rssi));
                this.push(frame);
            },
        );
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
