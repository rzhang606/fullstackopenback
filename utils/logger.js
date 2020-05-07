const info = (...params) => {
    console.log(...params);
};

const error = (...params) => {
    console.error(...params);
};

const httpError = (code, message, res) => {
    console.error(`Error code ${code}: `, message);
    return res.status(code).json(
        `error: ${message}`
    );
};

module.exports = {
    info,
    error,
    httpError
};