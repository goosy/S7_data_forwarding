import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

class PV_dict extends Map {
    add(PV) {
        if (this.has(PV.tag_name)) throw new Error(`tag ${PV.tag_name} already exists`);
        this.set(PV.tag_name, PV);
    }
}

/**
 * Asynchronously fetches and parses a configuration file.
 *
 * @param {string} config_path - the path to the configuration file
 * @return {Promise<object>} an object containing the parsed configuration
 */
export async function fetch_config(config_path) {
    const config = parse(await readFile(config_path, { encoding: "utf8" }));

    const forward = config.forward;
    const connections = Object.entries(config.connections).map(
        ([name, host]) => ({ name, host, tag_addr_map: {}, devices: [] })
    );

    const tags_dict = new PV_dict();
    const devices = config.devices;
    for(const device of devices) {
        const conn = connections.find(conn => conn.name === device.connection);
        if (!conn) throw new Error(`connection ${device.connection} isn't defined`);
        conn.devices.push(device);
        for (const PV of device.PVs) {
            const tag_name = `${device.connection}_${device.name}_${PV.name}`;
            PV.tag_name = tag_name;
            PV.device = device;
            PV.forward ??= forward.mode;
            tags_dict.add(PV);
            conn.tag_addr_map[tag_name] = PV.address;
        }
    }
    const tags = [...tags_dict.values()];
    return { forward, connections, tags };
}

export async function fetch_template(template_path) {
    return await readFile(template_path, { encoding: "utf8" });
}
