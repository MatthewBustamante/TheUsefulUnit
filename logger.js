const pino = require("pino");
const logger = pino({ level: "warn" }, pino.destination("logs/server-log"));

module.exports = logger;
