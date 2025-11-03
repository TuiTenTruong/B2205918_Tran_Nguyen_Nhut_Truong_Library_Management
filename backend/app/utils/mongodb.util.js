const { MongoClient } = require("mongodb");

class MongoDB {
	static connect = async (uri) => {
		if (this.client) return this.client;
		this.client = new MongoClient(uri);
		return this.client;
	};
}

module.exports = MongoDB;
