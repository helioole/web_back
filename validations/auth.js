import {body} from 'express-validator';

export const registerValidation = [
    body('email', 'Incorrect email formal').isEmail(),
    body('password', 'Password should consist of least 6 characters').isLength({min:6}),
    body('fullName', 'Enter name of least 3 characters').isLength({min:3}),
    body('avatarUrl', 'Wrong avatar URL').optional().isURL(),
];