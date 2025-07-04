import userService from '../services/user.service.js';
import jwt from 'jsonwebtoken';

const register = async (req, res) => {
    try {
        const { name,email,password } = req.body;
        const result = await userService.register(name,email,password);
        
        // Configurar cookie con opciones de seguridad
        res.cookie('token', result.token, {
            httpOnly: true, // Solo accesible desde el servidor
            secure: process.env.NODE_ENV === 'production', // HTTPS en producción
            sameSite: 'lax', // Protección CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días en millisegundos
        });
        
        res.status(201).json({ 
            message: 'Usuario registrado correctamente',
            user: result.user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
}


const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await userService.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getFavoritos = async (req, res) => {
    try {
        const { id } = req.params;
        const favoritos = await userService.getFavoritos(id);
        res.status(200).json(favoritos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const addFavorito = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId } = req.body;
        await userService.addFavorito(id, productId);
        res.status(200).json({ message: 'Producto añadido a favoritos' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const removeFavorito = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId } = req.body;
        await userService.removeFavorito(id, productId);
        res.status(200).json({ message: 'Producto eliminado de favoritos' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const confirmEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await userService.confirmEmail(token);
        if (!user) {
            return res.status(404).json({ message: 'Token de confirmación inválido' });
        }
        res.status(200).json({ message: 'Email confirmado correctamente', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await userService.login(email, password);
       
        if (!result) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        
        // Configurar cookie con opciones de seguridad
        res.cookie('token', result.token, {
            sameSite: 'lax', // Protección CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días en millisegundos
        });
        
        res.status(200).json({ 
            message: 'Login exitoso',
            user: result.user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const logout = async (req, res) => {
    try {
        // Limpiar la cookie del token
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        
        res.status(200).json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const profile = async (req, res) => {
    try {
        const favoritos = await userService.getFavoritos(req.user.id);
        res.status(200).json({
            message: 'Sesión válida',
           favoritos: favoritos,
        });
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
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
    logout,
    profile
};