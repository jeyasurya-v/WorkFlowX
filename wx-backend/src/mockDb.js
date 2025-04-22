/**
 * Mock Database
 * 
 * Provides in-memory database functionality when MongoDB is not available.
 * This is a simplified implementation to allow the app to run without external dependencies.
 */

class MockDb {
  constructor() {
    this.collections = {
      users: [],
      organizations: [],
      pipelines: [],
      integrations: []
    };
    console.log('🔄 Mock database initialized');
  }

  // User methods
  async findUserByEmail(email) {
    return this.collections.users.find(user => user.email === email);
  }

  async findUserById(id) {
    return this.collections.users.find(user => user.id === id);
  }

  async createUser(userData) {
    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.collections.users.push(newUser);
    return newUser;
  }

  // Organization methods
  async findOrganizationById(id) {
    return this.collections.organizations.find(org => org.id === id);
  }

  async findOrganizationsByUser(userId) {
    return this.collections.organizations.filter(org => 
      org.members.some(member => member.userId === userId)
    );
  }

  // Mock connection object for compatibility
  get connection() {
    return {
      close: () => Promise.resolve()
    };
  }
}

// Singleton instance
const mockDb = new MockDb();

module.exports = mockDb; 