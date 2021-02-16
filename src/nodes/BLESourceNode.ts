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
        this.options.interval = this.options.interval || 3000;
        if (this.options.autoStart) {
            this.once('build', this.start.bind(this));
        }
        this.once('destroy', this.stop.bind(this));
    }

    public start(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._manager = new BleManager();
            this._manager.onStateChange((state) => {
                if (state === 'PoweredOn') {
                    resolve();
                    this.scan();
                } else {
                    reject(state);
                }
            }, true);
        });
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            clearInterval(this._timer);
            this._manager.stopDeviceScan();
            resolve();
        });
    }

    public scan(): void {
        this._timer = setInterval(() => {
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
                        return;
                    }

                    const frame = new DataFrame();
                    const beacon = new RFTransmitterObject(device.id);
                    beacon.displayName = device.localName;

                    frame.addObject(beacon);
                    frame.source = this.source;
                    frame.source.removeRelativePositions(beacon.uid);
                    frame.source.addRelativePosition(new RelativeRSSIPosition(beacon, device.rssi));

                    this.push(frame);
                },
            );
        }, this.options.interval);
    }

    public onPull(): Promise<DataFrame> {
        return new Promise<DataFrame>((resolve) => {
            resolve(undefined);
        });
    }
}

export interface BLESourceNodeOptions extends SensorSourceOptions {
    uuids: string[];
}
