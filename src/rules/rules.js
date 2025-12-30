const rules = {
    api_read: {
        capacity: 100,          // max tokens in bucket
        refillRate: 100,        // tokens added
        refillInterval: 60      // per 60 seconds
    },

    api_write: {
        capacity: 20,
        refillRate: 20,
        refillInterval: 60
    }
};

module.exports = rules;
