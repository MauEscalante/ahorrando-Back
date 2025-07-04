import userService from '../services/user.service.js';
import jwt from 'jsonwebtoken';

const register = async (req, res) => {
    try {
        const { name,email,password } = req.body;
        const result = await userService.register(name,email,password);
         const confirmLink = `http://localhost:${process.env.PORT}/api/users/confirm-user/${result.token}`;

    const subject = "Confirm your account - Ahorrando";
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your Account</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color:rgb(50, 123, 255);
            color: #ffffff;
            text-align: center;
            padding: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
          }
          .content p {
            margin: 10px 0;
          }
          .btn {
            display: inline-block;
            background-color:rgb(50, 123, 255);
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 20px;
            font-size: 16px;
          }
          .btn:hover {
            background-color:rgb(0, 153, 255);
          }
          .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777777;
            background-color: #f4f4f4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Confirma tu cuenta</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${name}</strong>,</p>
            <p>Gracias por registrarte en <strong>Ahorrando</strong>. Por favor, confirma tu cuenta haciendo clic en el botón de abajo:</p>
            <a href="${confirmLink}" class="btn">Confirmar cuenta</a>
            <p>Si no solicitaste esta cuenta, puedes ignorar este correo electrónico.</p>
            <p>Este enlace expirará en 24 horas.</p>
          </div>
          <div class="footer">
            <p>Este correo fue enviado desde Ahorrando.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await userService.sendConfirmationEmail({ email: result.user.email, subject, html });

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
        const decoded=jwt.verify(token, process.env.SECRET_JWT);
        const userId=decoded.id
        const user = await userService.confirmEmail(userId);
        if (!user) {
            return res.status(404).json({ message: 'Token de confirmación inválido' });
        }
        res.redirect('http://localhost:3000/login');
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