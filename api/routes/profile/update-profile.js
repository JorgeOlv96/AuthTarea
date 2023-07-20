import { Router } from 'express';
import { body,validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const updateUser = Router();

updateUser.put(
  '/',
  // Validación de los datos de entrada
  body('username').optional().notEmpty().trim(),
  body('password').optional().isLength({ min: 6 }),

  async (request, response) => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
   return response.status(400).json({ errors: errors.array() });
      }

      const token = request.headers.authorization.split(' ')[1];

      const decodedToken = jwt.verify(token, JWT_SECRET);

      const userId = decodedToken.userId;

      const user = await UserModel.findById(userId);

if (!user) {
          return response.status(404).json({
            error: 'El usuario no se encontró',
          });
        }
  
        // Actualizar la información 
        if (request.body.username) {
          user.username = request.body.username;
          user.password = request.body.password;
        }
  
        await user.save();

        return response.status(200).json({
          username: user.username,
          password: user.password,
          updatedAt: user.updatedAt,
        });
  
      } catch (error) {
        console.error(`[updateUser]: ${error}`);
  
        if (error instanceof jwt.JsonWebTokenError) {
          return response.status(401).json({
            error: 'Token incorrecto',
          });
        }
  
        return response.status(500).json({
          error: 'Error!',
        });
      }
    }
  );
