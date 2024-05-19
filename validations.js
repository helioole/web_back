import {body} from 'express-validator';

export const loginValidation = [
    body('email', 'Incorrect email formal').isEmail(),
    body('password', 'Password should consist of least 6 characters').isLength({min:6}),
];

export const registerValidation = [
    body('email', 'Incorrect email formal').isEmail(),
    body('password', 'Password should consist of least 6 characters').isLength({min:6}),
    body('fullName', 'Enter name of least 3 characters').isLength({min:3}),
    body('avatarUrl', 'Wrong avatar URL').optional().isURL(),
];

export const postCreateValidation = [
    body('title', 'Enter the title of the post').isLength({min: 3}).isString(),
    body('text', 'Write text of the post ').isLength({min:10}).isString(),
    body('tags', 'Wrong tag format').optional().isArray(),
    body('imageUrl', 'Wrong image URL').optional().isString(),
];