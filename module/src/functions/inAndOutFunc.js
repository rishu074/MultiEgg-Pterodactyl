function parseContains(sub_str, str) {
    return str.toString().trim().includes(sub_str)
}

function parseEquals(sub_str, str) {
    return str.toString().trim() === sub_str
}   

const allowed_functions = {
    "contains": parseContains,
    "equals": parseEquals
}

export default function parse_inputs_and_outputs(str, in_or_out) {
    for (let i = 0; i < Object.keys(allowed_functions).length; i++) {
        const key = Object.keys(allowed_functions)[i];
        if(str.startsWith(`$${key}(`)) {
            return allowed_functions[key](str.replace(`$${key}(`, "").replace(")", ""), in_or_out)
        }
    }

    return false
}