module.exports = {
	client: 'pg',
	connection: {
		host: process.env.POSTGRES_HOST || "localhost",
		port: process.env.POSTGRES_PORT || 5432,
		database: "maces",
		user: process.env.POSTGRES_USERNAME,
		password: process.env.POSTGRES_PASSWORD
	},
	pool: {
		min: 1,
		max: 16
	},
	migrations: {
		tableName: 'knex_migrations'
	}
};
