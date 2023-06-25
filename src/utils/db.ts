import mysql, { RowDataPacket } from "mysql2/promise";
import { env } from "../config/env";
import { OkPacket, PoolOptions } from "mysql2";

const dbConfig: PoolOptions = {
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: Number(env.DB_PORT) ?? 3306,
};

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Generic select function
export async function select<T>(
  table: string,
  whereClause?: string,
  params?: any[]
): Promise<T[]> {
  const connection = await pool.getConnection();
  try {
    const query = `SELECT * FROM ${table} ${whereClause || ""}`;
    const [results, extra] = (await connection.query(
      query,
      params
    )) as unknown as RowDataPacket[];

    return results as T[];
  } finally {
    connection.release();
  }
}
export async function selectOne<T>(
  table: string,
  whereClause?: string,
  params?: any[]
): Promise<T> {
  const connection = await pool.getConnection();
  try {
    const query = `SELECT * FROM ${table} ${whereClause || ""} limit 1`;
    const [results, extra] = (await connection.query(
      query,
      params
    )) as unknown as RowDataPacket[];

    return results[0] as T;
  } finally {
    connection.release();
  }
}

// Generic insert function
export async function insert(table: string, fields: any): Promise<any> {
  const connection = await pool.getConnection();
  try {
    const keys = Object.keys(fields).join(", ");
    const values = Object.values(fields);
    const placeholders = values.map(() => "?").join(", ");
    const query = `INSERT INTO ${table} (${keys}) VALUES (${placeholders})`;
    const [rows] = (await connection.query(query, values)) as unknown as OkPacket[];

    return { id: rows.insertId, ...fields };
  } finally {
    connection.release();
  }
}

// Generic update function
export async function update(
  table: string,
  fields: any,
  whereClause?: string,
  params?: any[]
): Promise<void> {
  const connection = await pool.getConnection();
  try {
    const setValues = Object.entries(fields)
      .map(([key, value]) => `${key} = ?`)
      .join(", ");
    const query = `UPDATE ${table} SET ${setValues} ${whereClause || ""}`;
    await connection.query(query, [...Object.values(fields), ...(params || [])]);
  } finally {
    connection.release();
  }
}

// Generic delete function
export async function deleteRows(
  table: string,
  whereClause?: string,
  params?: any[]
): Promise<void> {
  const connection = await pool.getConnection();
  try {
    const query = `DELETE FROM ${table} ${whereClause || ""}`;
    await connection.query(query, params);
  } finally {
    connection.release();
  }
}

// Transaction wrapper function

// ...

// export async function transaction(sqlStatements: Array<[string, any[]]>): Promise<void> {
//   let connection: PoolConnection;
//   try {
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     for (const [sql, params] of sqlStatements) {
//       await connection.query(sql, params);
//     }

//     await connection.commit();
//   } catch (error) {
//     if (connection) {
//       await connection.rollback();
//     }
//     throw error;
//   } finally {
//     if (connection) {
//       connection.release();
//     }
//   }
// }

export default {
  select,
  selectOne,
  insert,
  update,
  deleteRows,
  // transaction,
};
