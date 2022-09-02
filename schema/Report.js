const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const VercelBuildController = require('../controllers/VercelBuildController.js');

const ReportSchema = new Schema({
    website: {
        type: String,
        unique: true
    },
    notes: String,
    belongsTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: {
        type: Boolean,
        default: true
    },
    externalGuildDiscordId: String,
    messages: Array,
    billing: {
        state: {
            type: String,
            enum: ['NONE', 'PROCESSING', 'FAILED', 'COMPLETED'],
            default: 'NONE'
        },
        result: Schema.Types.Mixed
    }
}, { timestamps: true });

ReportSchema.post('save', function (doc) {
    setTimeout(() => {
        VercelBuildController.build();
    }, 1);
});

ReportSchema.post('remove', function (doc) {
    setTimeout(() => {
        VercelBuildController.build();
    }, 1);
});

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;