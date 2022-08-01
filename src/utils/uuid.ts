// Create a random UUID
// From: https://github.com/ScreepsOS/sos-library/blob/master/sos_lib_uuid.js
export function uuid(): string {
    let j: number
    let result = '';
    for(j=0; j<32; j++) {
        if( j === 8 || j === 12|| j === 16|| j === 20) {
            result += "-";
        }
        result += Math.floor(Math.random()*16).toString(16).toUpperCase();
    }
    return result;
}