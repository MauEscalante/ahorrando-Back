import User from '../model/User.js';
import Producto from '../model/Product.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mailSender from './nodemailer.js';
import { createTransport } from "nodemailer";
import { google } from "googleapis";


const register = async (name, email, password) => {
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('El usuario ya existe');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, Nombre: name, favoritos: [], isConfirmed: false });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.SECRET_JWT, {
            expiresIn: '7d' // Token expira en 7 días
        });

        return {
            token,
            user: {
                id: user._id,
                nombre: user.Nombre,
                email: user.email,
                isConfirmed: user.isConfirmed
            }
        };
    } catch (error) {
        // Si el error ya tiene un mensaje específico, manténlo
        if (error.message === 'El usuario ya existe') {
            throw error;
        }
        // Para errores de validación de MongoDB
        if (error.name === 'ValidationError') {
            throw new Error('Datos de usuario inválidos: ' + error.message);
        }

        throw new Error('Error al registrar usuario: ' + error.message);
    }
}

const getUserById = async (id) => {
    try {
        const user = await User.findById(id)
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return { nombre: user.Nombre, email: user.email, favoritos: user.favoritos, isConfirmed: user.isConfirmed };
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
        return { nombre: user.Nombre, favoritos: user.favoritos };
    } catch (error) {
        throw new Error('Error al obtener usuario por email');
    }
}

const getFavoritos = async (userId) => {
    try {
        const user = await User.findById(userId);
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
        // Verificar si el producto ya está en favoritos
        if (!user.favoritos.includes(productId)) {
            // Añadir el producto a favoritos
            user.favoritos.push(productId);
            await user.save();
        }
        await Producto.findByIdAndUpdate(productId, {
            $addToSet: {
                favoritedBy: {
                    email: user.email,
                }
            }
        });
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
        await User.findByIdAndUpdate(id, {
            $pull: { favoritos: productId }
        });
        await Producto.findByIdAndUpdate(productId, {
            $pull: {
                favoritedBy: { email: user.email }
            }
        });

    } catch (error) {
        throw new Error('Error al eliminar favorito');
    }
}

const confirmEmail = async (id) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { isConfirmed: true },
            { new: true }
        );

        if (!updatedUser) {
            throw new Error("User not found");
        }

        return updatedUser;
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
        const token = jwt.sign({ id: user._id }, process.env.SECRET_JWT, {
            expiresIn: '7d' // Token expira en 7 días
        });

        return {
            token,
            user: {
                id: user._id,
                nombre: user.Nombre,
                email: user.email,
                isConfirmed: user.isConfirmed,
                favoritos: user.favoritos
            }
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

const sendConfirmationEmail = async (user) => {
    try {
        const oAuth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        oAuth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        });

        const accessTokenResponse = await oAuth2Client.getAccessToken();
        const token = accessTokenResponse.token;
        const transporter = createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.MAIL,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: token,
            },
            tls: {
                rejectUnauthorized: false // Permitir conexiones TLS no seguras
            }
        });

        await mailSender({
            to: user.email,
            subject: user.subject,
            html: user.html,
            transporter: transporter
        });

    } catch (error) {
        console.error("Mensaje de error:", error);
        throw new Error('Error al enviar email de confirmación: ' + error.message);
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