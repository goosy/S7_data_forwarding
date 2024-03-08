import nodes7 from "nodes7";
import { EventEmitter } from 'node:events';

export class S7Connector extends EventEmitter {
    name;
    conn;
    tags = {};
    tag_addr_map;
    doneReading = false;
    doneWriting = false;

    valuesReady = (anythingBad, values) => {
        if (anythingBad) { console.log("SOMETHING WENT WRONG READING VALUES!!!!"); }
        this.tags = values;
        this.doneReading = true;
        this.emit('values_ready', values);
    }
    valuesWritten = (anythingBad) => {
        if (anythingBad) { console.log("SOMETHING WENT WRONG WRITING VALUES!!!!"); }
        console.log("Done writing.");
        this.doneWriting = true;
        this.emit('values_written');
    }

    connected = () => {
        const conn = this.conn;
        conn.setTranslationCB(tag => this.tag_addr_map[tag]);
        conn.addItems(Object.keys(this.tag_addr_map));
        setInterval(() => {
            this.doneReading = false;
            this.doneWriting = false;
            conn.readAllItems(this.valuesReady);
        }, 500);
    }

    constructor({ name, host, tag_addr_map }) {
        super();
        host.debug ??= false;
        this.name = name;
        this.tag_addr_map = tag_addr_map;
        this.setMaxListeners(1024);
        this.conn = new nodes7;
        this.conn.initiateConnection(host, err => {
            if (typeof (err) !== "undefined") {
                // TODO: make it retry later
                console.log(err);
                process.exit();
            }
            this.connected();
        });
    }
}
