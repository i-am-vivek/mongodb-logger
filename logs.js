const mongoose = require('mongoose');
const { Schema } = mongoose;

const tableSchema = new Schema(
    {
        timestamp: Date,
        level: String,
        message: String,
        meta: {},
    },
    {
        timestamps: {
            createdAt: 'created_at',
        },
    }
);

module.exports = mongoose.model('logs', tableSchema);
