const { readJsonFile, writeJsonFile } = require('./datastore'); 

function seedDatabase() {
    try {
        const articles = readJsonFile('articles.json');

        if (articles.length > 0) {
            console.log("⚡ Database already has data. Skipping seed.");
            return;
        }

        console.log(" Database is empty. Injecting 5 dummy articles...");

        // Keys use camelCase to match the frontend
        const dummyArticles = [
            {
                id: "RP1001IN",
                status: "Pending",
                recipientName: "Rahul Sharma",
                articleType: "Registered Post",
                clientTimestamp: new Date().toISOString()
            },
            {
                id: "SP2002IN",
                status: "Pending",
                recipientName: "Priya Das",
                articleType: "Speed Post",
                clientTimestamp: new Date().toISOString()
            },
            {
                id: "PA3003IN",
                status: "Pending",
                recipientName: "Amit Kumar",
                articleType: "Parcel",
                clientTimestamp: new Date().toISOString()
            },
            {
                id: "SP4004IN",
                status: "Pending",
                recipientName: "Sunita Patel",
                articleType: "Speed Post",
                clientTimestamp: new Date().toISOString()
            },
            {
                id: "RP5005IN",
                status: "Pending",
                recipientName: "Vikram Singh",
                articleType: "Registered Post",
                clientTimestamp: new Date().toISOString()
            }
        ];

        writeJsonFile('articles.json', dummyArticles);
        console.log("📥 5 Demo articles successfully injected into data/articles.json!");

    } catch (error) {
        console.error("❌ Seeding failed. Ensure your dataStore is configured correctly.", error.message);
    }
}

seedDatabase();
module.exports = { seedDatabase };