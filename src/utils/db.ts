import { createPool, Pool, PoolConnection, RowDataPacket } from "mysql2/promise";

let pool: Pool;

export const connectToDatabase = async (): Promise<void> => {
  pool = createPool({
    host: "localhost",
    user: "your_username",
    password: "your_password",
    database: "your_database",
    connectionLimit: 10,
  });
};

export const getConnection = async (): Promise<PoolConnection> => {
  return pool.getConnection();
};

export const executeQuery = async <T>(query: string, values?: any[]): Promise<T[]> => {
  const connection = await getConnection();
  const [rows] = await connection.query(query, values);
  connection.release();
  return rows as T[];
};
