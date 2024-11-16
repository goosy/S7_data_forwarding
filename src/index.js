import { posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { S7Connector } from './IO_driver.js';
import { fetch_config, fetch_template } from './config.js';
import { send_json } from './json_forward.js';

process.stdin.setEncoding('utf-8');
// process.stdin.setRawMode(true);
// 监听键盘事件
process.stdin.on('data', data => {
    if (data.startsWith('close')) {
        process.exit();
    }
});

const module_path = posix.join(fileURLToPath(import.meta.url).replace(/\\/g, '/'), "..");
const work_path = process.cwd().replace(/\\/g, '/');
const config_path = posix.join(work_path, "data_define.yaml");
const template_path = posix.join(work_path, "json.template");
const { forward, connections, tags } = await fetch_config(config_path);
const template = await fetch_template(template_path);

export const context = {
    module_path,
    work_path,
    // version: pkg.version,
    silent: true,
};

function log(msg) {
    context.silent || console.log(msg);
}

function on_values_ready(conn, values) {
    conn.devices.forEach(device => {
        device.PVs.forEach(PV => {
            const value = values[PV.tag_name];
            if (PV.type === 'REAL') {
                const diff = PV.value - value;
                if (diff > 0.0001 || diff < -0.0001) PV.changed = true;
            } else {
                if (PV.value != value) PV.changed = true;
            }
            PV.value = value;
            const comment = `${device.comment}.${PV.comment}`;
            const tag = `${device.name}.${PV.name}: ${PV.value}`.padEnd(50, ' ').slice(0, 50);
            log(`${tag} ${comment}`);
        });
    });
}

connections.forEach(conn => {
    const connector = new S7Connector(conn);
    connector.on('values_ready', (values) => on_values_ready(conn, values));
})

setTimeout(
    () => send_json(forward, tags, template),
    2000 // send after 2 seconds to ensure the data is valid
);
