import {
    Absolute2DPosition, DataSerializer,
} from '@openhps/core';
import { EventEmitter } from 'events';
import { Thread } from 'react-native-threads';

export class OfflineModel extends EventEmitter {
    private _thread: Thread;

    constructor() {
        super();
        this.on('log', (level: string, log: any) => {
            console.log(level, log);
        });
    }

    public startRecording(position: Absolute2DPosition): void {
        this._thread.postMessage(JSON.stringify({
            action: "startRecording",
            position: DataSerializer.serialize(position)
        }));
    }

    public stopRecording(): void {
        this._thread.postMessage(JSON.stringify({
            action: "stopRecording"
        }));
    }

    public init() {
        console.log("Creating positioning model");
        this._thread = new Thread("external/workers/worker.js");
        this._thread.onmessage = this._onMessage.bind(this);
        this._thread.postMessage(JSON.stringify({
            action: "init"
        }));
    }

    public destroy() {
        this._thread.terminate();
        this._thread = undefined;
    }

    private _onMessage(message: string): void {
        const json = JSON.parse(message);
        if (json.event) {
            this.emit(json.event, ...json.args);
        }
    }

    public connect(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this._thread.postMessage(JSON.stringify({
                action: "connect",
                url
            }));
            this.once('connect', (status) => {
                if (status) {
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

}
