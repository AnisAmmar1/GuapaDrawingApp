const mongoose = require('mongoose');

const drawingSchema = new mongoose.Schema({
    dataURL: String,
});

const Drawing = mongoose.model('Drawing', drawingSchema);

module.exports = Drawing;