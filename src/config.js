import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

const tags_dict = {
    add(PV) {
        if (tags_dict[PV.tag_name]) throw new Error(`tag ${PV.tag_name} already exists`);
        tags.push(PV);
        this[PV.tag_name] = true;
    }
};
export const tags = [];

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
    const devices = config.devices;
    devices.forEach(device => {
        const conn = connections.find(conn => conn.name === device.connection);
        if (!conn) throw new Error(`connection ${device.connection} isn't defined`);
        conn.devices.push(device);
        device.PVs.forEach(PV => {
            const tag_name = device.connection + '_' + device.name + '_' + PV.name;
            PV.tag_name = tag_name;
            PV.device = device;
            tags_dict.add(PV);
            conn.tag_addr_map[tag_name] = PV.address;
        })
    })
    return { forward, connections, devices };
}

export async function fetch_template(template_path) {
    return await readFile(template_path, { encoding: "utf8" });
}
