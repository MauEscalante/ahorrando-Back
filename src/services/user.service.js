import User from '../model/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const register = async (email, password, nombre, apellido) => {
    try{
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('El usuario ya existee');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, nombre, apellido, favoritos: [], isConfirmed: false });
        await user.save();
        return user;
    } catch (error) {
        throw new Error('Error al registrar usuario');
    }
}

const getUserById = async (id) => {
    try {
        const user = await User.findById(id)
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return {nombre: user.nombre, email: user.email, favoritos: user.favoritos, isConfirmed: user.isConfirmed};
    } catch (error) {
        throw new Error('Error al obtener usuario por ID');
    }
}

const getUserByEmail = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return {nombre: user.nombre, favoritos: user.favoritos};
    } catch (error) {
        throw new Error('Error al obtener usuario por email');
    }
}

const getFavoritos = async (id) => {
    try {
        const user = await User.findById(id).populate('favoritos');
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return user.favoritos;
    } catch (error) {
        throw new Error('Error al obtener favoritos');
    }
}

const addFavorito = async (id, productId) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        if (!user.favoritos.includes(productId)) {
            user.favoritos.push(productId);
            await user.save();
        }
    } catch (error) {
        throw new Error('Error al añadir favorito');
    }
}

const removeFavorito = async (id, productId) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        user.favoritos = user.favoritos.filter(fav => fav.toString() !== productId);
        await user.save();
    } catch (error) {
        throw new Error('Error al eliminar favorito');
    }
}

const confirmEmail = async (token) => {
    try {
        const user = await User.findOne({ confirmationToken: token });
        if (!user) {
            throw new Error('Token de confirmación inválido');
        }
        user.isConfirmed = true;
        user.confirmationToken = undefined;
        await user.save();
        return user;
    } catch (error) {
        throw new Error('Error al confirmar email');
    }
}

const login = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Contraseña incorrecta');
        }
        if (!user.isConfirmed) {
            throw new Error('Email no confirmado');
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        return { token, user: { id: user._id, email: user.email, nombre: user.nombre, apellido: user.apellido } };
    } catch (error) {
        throw new Error(error.message);
    }
}

const sendConfirmationEmail = async (user) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const token = crypto.randomBytes(32).toString('hex');
        user.confirmationToken = token;
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Confirmación de Email',
            text: `Por favor, confirma tu email haciendo clic en el siguiente enlace: ${process.env.BASE_URL}/confirm/${token}`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error('Error al enviar email de confirmación');
    }
}

export default {
    register,
    getUserById,
    getUserByEmail,
    getFavoritos,
    addFavorito,
    removeFavorito,
    confirmEmail,
    login,
    sendConfirmationEmail
};