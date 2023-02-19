module.exports = class kLogger {
    constructor(setting) {
        this.setting = {
            info: setting.info,
            debug: setting.debug,
            error: setting.error,
        }
    }
    info(txt) {
        const dt = new Date();
        const time = `${dt.getFullYear()}/${dt.getMonth()}/${dt.getDay()}/${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}`
        if (this.setting.info) {
            console.info(`[${time}][info] ${txt}`);
        }
    }
    debug(txt) {
        const dt = new Date();
        const time = `${dt.getFullYear()}/${dt.getMonth()}/${dt.getDay()}/${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}`
        if (this.setting.debug) {
            console.debug(`[${time}][debug] ${txt}`);
        }
    }
    error(txt) {
        const dt = new Date();
        const time = `${dt.getFullYear()}/${dt.getMonth()}/${dt.getDay()}/${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}`
        if (this.setting.error) {
            console.error(`[${time}][error] ${txt}`);
        }
    }
}