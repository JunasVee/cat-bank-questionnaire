import sql from "mssql"

const config: sql.config = {
  server: "103.190.29.70",
  database: "cat_questionnaire", // You may need to update this with the actual database name
  user: "mitral.sucihr",
  password: "mitral123",
  options: {
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
}

let pool: sql.ConnectionPool | null = null

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (pool) {
    return pool
  }
  
  try {
    pool = await sql.connect(config)
    console.log("Database connected successfully")
    return pool
  } catch (error) {
    console.error("Database connection failed:", error)
    throw error
  }
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close()
    pool = null
  }
}

export { sql }
