const scripts = {
    "clear": () => console.clear()
}

export default function performEntryScripts(data) {
    data.map((v, i) => {
        if(scripts[v]) {
            scripts[v]()
        }
    })
}