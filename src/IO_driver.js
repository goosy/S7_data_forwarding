import nodes7 from "nodes7";
import { EventEmitter } from 'node:events';

export class S7Connector extends EventEmitter {
    name;
    conn;
    tags = {};
    tag_addr_map;
    connfailed = true;

    valuesReady = (anythingBad, values) => {
        if (anythingBad) { console.log("SOMETHING WENT WRONG READING VALUES!!!!"); }
        this.tags = values;
        this.connfailed = false;
        this.emit('values_ready', values);
    }
    valuesWritten = (anythingBad) => {
        if (anythingBad) { console.log("SOMETHING WENT WRONG WRITING VALUES!!!!"); }
        console.log("Done writing.");
        this.connfailed = false;
        this.emit('values_written');
    }

    connected = () => {
        console.info(`connected to S7 PLC ${this.name}!`);
        const conn = this.conn;
        conn.setTranslationCB(tag => this.tag_addr_map[tag]);
        conn.addItems(Object.keys(this.tag_addr_map));
        setInterval(() => {
            conn.readAllItems(this.valuesReady);
        }, 500);
    }
    on_error(error) {
        if (!this.connfailed) console.error(`S7 connection error: ${error ?? "unknown error"}`);
        this.connfailed = true;
        this.emit("connfailed");
    };

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
                this.error(err);
                process.exit();
            }
            this.connected();
        });
    }
}
