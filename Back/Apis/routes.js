const express = require('express');
const path = require('path');
const fs = require ('fs');
const Drawing = require('../Model/drawingModel');
const router = express.Router();

app.post('/save-drawing', async (req, res) => {
    const { dataURL } = req.body;

    try {
        const newDrawing = new Drawing({ dataURL });
        await newDrawing.save();
        res.json({ message: 'Drawing saved successfully!' });

        const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
        const imagePath = path.join('C:\\Users\\A N I S\\Desktop', `drawing_${Date.now()}.png`);

        fs.writeFileSync(imagePath, base64Data, 'base64');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/get-drawings', async (req, res) => {
    try {
        const drawings = await Drawing.find();
        res.json(drawings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
module.exports = router;