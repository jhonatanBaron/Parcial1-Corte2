const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const uploader = require('./uploader');
const statusStore = require('./statusStore');

const app = express();
const upload = multer({ dest: '/app/uploads/' });

app.post('/upload', upload.single('image'), async (req, res) => {
  const id = uuidv4();
  statusStore.set(id, { status: 'uploaded', file: req.file.filename });
  await uploader.sendToQueue(id, req.file.path);
  res.json({ id });
});

app.get('/status/:id', (req, res) => {
  const status = statusStore.get(req.params.id);
  if (!status) return res.status(404).json({ error: 'Not found' });
  res.json(status);
});

app.listen(3000, () => console.log('API on http://localhost:3000'));
