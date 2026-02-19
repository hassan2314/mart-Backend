import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const invitationSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"], // Invited users can be managers or admins
            default: "user",
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        isAccepted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Method to generate invitation token
invitationSchema.methods.generateInvitationToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email, role: this.role },
        process.env.INVITATION_TOKEN_SECRET,
        { expiresIn: "1h" } // Token valid for 1 hour
    );
};

export const Invitation = mongoose.model("Invitation", invitationSchema);
