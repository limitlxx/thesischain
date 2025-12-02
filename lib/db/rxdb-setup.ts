// Stub file for rxdb-setup
// RxDB has been migrated to MongoDB - this is a compatibility stub

export async function getDatabase() {
  throw new Error('RxDB has been migrated to MongoDB. Please use MongoDB operations instead.');
}

export default {
  getDatabase,
};
