import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String },
    createdAt: { type: Date, default: Date.now },
    subscriptionPlan: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
    smsBalance: { type: Number, default: 0 }
});

const ShopSchema = new Schema({
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    mobile: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const TransactionSchema = new Schema({
    shopId: { type: String, required: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['DUE', 'PAYMENT'], required: true },
    date: { type: String, required: true },
    mobileNumber: { type: String }, // Optional in original type but good to have
    createdAt: { type: Date, default: Date.now },
    dueDate: { type: String }
});

// Used for virtuals if needed to map _id to id, but we'll handle in DAL
UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret: any) { delete ret._id; }
});
ShopSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret: any) { delete ret._id; }
});
TransactionSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret: any) { delete ret._id; }
});

export const UserModel = models.User || model('User', UserSchema);
export const ShopModel = models.Shop || model('Shop', ShopSchema);
export const TransactionModel = models.Transaction || model('Transaction', TransactionSchema);
