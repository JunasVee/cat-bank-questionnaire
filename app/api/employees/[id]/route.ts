import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

// GET /api/employees/[id] — look up an employee by employee_id (integer)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employeeId = parseInt(params.id)
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
    }

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("employeeId", sql.Int, employeeId)
      .query(`
        SELECT
          e.employee_id,
          e.username,
          e.name,
          e.program_id,
          p.program_name,
          r.role_name
        FROM mst_employee e
        LEFT JOIN mst_program p ON e.program_id = p.program_id
        LEFT JOIN mst_role r ON e.role_id = r.role_id
        WHERE e.employee_id = @employeeId
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const emp = result.recordset[0]
    return NextResponse.json({
      id: emp.employee_id,
      username: emp.username,
      name: emp.name,
      programId: emp.program_id,
      department: emp.program_name ?? "",
      role: emp.role_name,
    })
  } catch (error) {
    console.error("GET /api/employees/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 })
  }
}
