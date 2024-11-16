import { convert } from 'gooconverter';

export function send_json(forward, tags, template) {
    tags.forEach(PV => PV.changed = true);
    function send() {
        const PVs = tags.filter(PV => PV.changed || PV.forward === 'complete');
        const timestamp = new Date().toISOString();
        const json = convert({ PVs, timestamp }, template);
        fetch(forward.url, {
            method: 'POST',
            body: json,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
        }).then(
            res => res.json()
        ).then(json => {
            if (json.success === true) {
                console.log("send ok");
                PVs.forEach(PV => PV.changed = false);
            }
        }).catch(err => {
            console.log(err);
        });
    }
    setInterval(send, forward.period);
};