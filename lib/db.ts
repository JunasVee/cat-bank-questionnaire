import sql from "mssql"

const config: sql.config = {
  server: "103.190.29.70",
  port: 1433,
  database: "SAR_REVAMP",
  user: "mitral.sucihr",
  password: "StrongPassword#2026",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
}

let pool: sql.ConnectionPool | null = null

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool
  }
  try {
    pool = await sql.connect(config)
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
