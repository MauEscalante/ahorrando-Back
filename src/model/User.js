import { Schema, model } from "mongoose";

const UserSchema = new Schema({
    Nombre: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    favoritos: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isConfirmed: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
    versionKey: false
});

export default model('User', UserSchema);