const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const dotenv = require('dotenv');

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => console.log(err));


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

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
