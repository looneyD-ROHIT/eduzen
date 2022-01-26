const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
	{
		emailId: {type: String, required: true, unique: true},
		firstName: { type: String, required: true},
		lastName: { type: String, required: true}
	},
	{ collection: 'subscriptions' }
);

const model = mongoose.model('newsSchems', newsSchema);

module.exports = model;
