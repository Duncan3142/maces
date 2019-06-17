module.exports = {
	client: 'pg',
	connection: process.env.DATABASE_URL,
	pool: {
		min: 1,
		max: 16
	},
	migrations: {
		tableName: 'knex_migrations'
	}
};
