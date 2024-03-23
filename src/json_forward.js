import { convert } from 'gooconverter';

export function send_json(forward, tags, template) {
    const is_incremental = forward.mode === 'incremental';
    tags.forEach(PV => PV.changed = true);
    function send() {
        const PVs = is_incremental
            ? tags.filter(PV => PV.changed)
            : tags;
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
    setTimeout(
        () => setInterval(send, forward.period),
        2000 // send after 2 seconds to ensure the data is valid
    );
};