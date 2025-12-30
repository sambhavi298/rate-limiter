module.exports = {
    // Default rule: 10 requests burst, 1 request per second refill
    default: {
        capacity: 10,
        rate: 1,
    },
    // API specific rule example
    api_v1: {
        capacity: 50,
        rate: 5,
    }
};
