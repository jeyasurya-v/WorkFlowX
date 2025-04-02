// Step 1: Import Required Modules
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

{
  /*
- DataTypes → Defines column types (INTEGER, STRING, ENUM, etc.).
- Model → The base class for defining a Sequelize model.
- Optional → Used to make some attributes optional (like id during creation).
- sequelize → The database connection imported from config/db.ts.
*/
}

// Step 2: Define User Attributes Interface
interface UserAttributes {
  id: number;
  email: string;
  password: string;
  role: "admin" | "manager" | "employee";
  tenantId: string;
}

{
  /*
- Defines the structure of a user in TypeScript.
- Every user has:
   - id (primary key).
   - email (unique identifier).
   - password (hashed).
   - role (one of admin, manager, or employee).
   - tenantId (used for multi-tenancy).
*/
}

// Step 3: Define User Creation Attributes
interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

{
  /*
- Optional<UserAttributes, 'id'> → Makes id optional during user creation.
- id is auto-incremented by PostgreSQL, so we don’t manually set it when creating a new user.
*/
}

// Step 4: Create the User Model Class
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public email!: string;
  public password!: string;
  public role!: "admin" | "manager" | "employee";
  public tenantId!: string;
}

{/*
- This class extends Sequelize’s Model class.
- It implements UserAttributes, enforcing TypeScript checks.
- Each field (id, email, etc.) is marked as public and has a non-null assertion (!) because Sequelize assigns them at runtime.
*/}

// Step 5: Define the User Table Schema
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "manager", "employee"),
      defaultValue: "employee",
    },
    tenantId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);

{/*
id
- INTEGER: Stores numbers.
- autoIncrement: true: PostgreSQL auto-generates id values.
- primaryKey: true: Makes it the unique identifier.

email
- STRING: Stores email as text.
- allowNull: false: Email must be provided.
- unique: true: No two users can have the same email.

password
- STRING: Stores hashed passwords.
- allowNull: false: Password must be provided.

role
- ENUM: Can only be 'admin', 'manager', or 'employee'.
- defaultValue: 'employee': If not specified, defaults to "employee".

tenantId
- STRING: Used for multi-tenancy (to separate users across different organizations).
- allowNull: false: Mandatory field.

- sequelize → Links this model to our PostgreSQL connection.
- modelName: 'User' → This tells Sequelize to create a Users table in PostgreSQL (pluralized automatically).
*/}

export default User;
