import mongoose from 'mongoose';

const partnerPosterSchema = new mongoose.Schema({
    position: { 
        type: String, 
        required: true, 
        enum: ['left', 'right'],
        unique: true 
    },
    imageUrl: { 
        type: String, 
        required: true 
    },
    link: { 
        type: String, 
        default: '' 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

export default mongoose.model('PartnerPoster', partnerPosterSchema);
