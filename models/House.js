const {Schema, model} = require('mongoose');

const schema = new Schema({
    name: {type: String, required: true, minLength: [6, 'Name should be at least 6 characters long']},
    type: {type: String, required: true, enum: ['Apartment', 'Villa', 'House']},
    year: {type: Number, required: true, min: [1850, 'Earliest year is 1850'], max: [2021, 'Latest year is 2021']},
    city: {type: String, required: true, minLength: [4, 'City name should be at least 4 characters long']},
    imageUrl: {type: String, required: true, match:[/^https?/, 'Image must be valid URL']},
    description: {type: String, required: true, maxLength: [60, 'Description must be less than 60 characters long']},
    piecesAvailable: {type: Number, required: true, min: 0, max: 10},
    rentedBy: [{type: Schema.Types.ObjectId, ref: 'User'}],
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    createdAt: {type: Date, default: Date.now}
})

module.exports = model('House', schema)