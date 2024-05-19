import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';

import { registerValidation, loginValidation, postCreateValidation } from './validations.js';
import { handleValidationErrors, checkAuth } from './utils/index.js';
import { UserController, PostController } from './controllers/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

mongoose
  .connect('mongodb+srv://DtmyChwsejeCGqkC:DtmyChwsejeCGqkC@cluster0.vbmxfw5.mongodb.net/lab?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();

app.use(express.json());


const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Documentation',
      version: '1.0.0',
      description: 'API Documentation generated with Swagger',
    },
    servers: [
      {
        url: 'http://localhost:4444',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Enter your bearer token in the format `Bearer <token>`',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);


const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));


app.post('/api/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/api/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/api/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/api/posts/tags', PostController.getLastTags);

app.get('/api/posts', PostController.getAll);
app.get('/api/posts/:id', PostController.getOne);
app.post('/api/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/api/posts/:id', checkAuth, PostController.remove);
app.put(
  '/api/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log('Server OK');
});
