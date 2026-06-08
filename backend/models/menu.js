const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);