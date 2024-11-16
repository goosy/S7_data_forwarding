import { convert } from 'gooconverter';

export function send_json(forward, tags, template) {
    for (const PV of tags) PV.changed = true;
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
                for (const PV of PVs) PV.changed = false;
            }
        }).catch(err => {
            console.log(err);
        });
    }
    setInterval(send, forward.period);
};