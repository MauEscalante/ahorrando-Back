import userService from '../services/user.service.js';

const register = async (req, res) => {
    try {
        const { email, password, nombre, apellido } = req.body;
        const user = await userService.register(email, password, nombre, apellido);
        res.status(201).json({ message: 'Usuario registrado correctamente', user });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error al registrar usuario' });
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
        console.error('Error al obtener usuario por ID:', error);
        res.status(500).json({ message: 'Error al obtener usuario por ID' });
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
        console.error('Error al obtener usuario por email:', error);
        res.status(500).json({ message: 'Error al obtener usuario por email' });
    }
}

const getFavoritos = async (req, res) => {
    try {
        const { id } = req.params;
        const favoritos = await userService.getFavoritos(id);
        res.status(200).json(favoritos);
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).json({ message: 'Error al obtener favoritos' });
    }
}
const addFavorito = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId } = req.body;
        await userService.addFavorito(id, productId);
        res.status(200).json({ message: 'Producto añadido a favoritos' });
    } catch (error) {
        console.error('Error al añadir favorito:', error);
        res.status(500).json({ message: 'Error al añadir favorito' });
    }
}

const removeFavorito = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId } = req.body;
        await userService.removeFavorito(id, productId);
        res.status(200).json({ message: 'Producto eliminado de favoritos' });
    } catch (error) {
        console.error('Error al eliminar favorito:', error);
        res.status(500).json({ message: 'Error al eliminar favorito' });
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
        console.error('Error al confirmar email:', error);
        res.status(500).json({ message: 'Error al confirmar email' });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userService.login(email, password);
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        res.status(200).json({ message: 'Login exitoso', user });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
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
    login
};