const rules = {
    api_read: {
        id: "api_read",
        capacity: 100,
        refillRate: 100,
        refillInterval: 60
    },

    api_write: {
        id: "api_write",
        capacity: 20,
        refillRate: 20,
        refillInterval: 60
    }
};

module.exports = rules;
