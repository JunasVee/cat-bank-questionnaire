import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

// PUT /api/validation-requests/[id] — supervisor approves / rejects / revision
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const requestId = parseInt(id)
    const { status, supervisorNotes } = await req.json()

    if (!["approved", "rejected", "revision_required"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const pool = await getConnection()
    const transaction = new sql.Transaction(pool)
    await transaction.begin()

    try {
      // Get the request to find employee + skill
      const reqResult = await new sql.Request(transaction)
        .input("requestId", sql.Int, requestId)
        .query(`
          SELECT employee_id, skill_id FROM trx_validation_request
          WHERE request_id = @requestId
        `)

      if (reqResult.recordset.length === 0) {
        await transaction.rollback()
        return NextResponse.json({ error: "Request not found" }, { status: 404 })
      }

      const { employee_id, skill_id } = reqResult.recordset[0]

      // Update validation request
      await new sql.Request(transaction)
        .input("requestId", sql.Int, requestId)
        .input("status", sql.VarChar(50), status)
        .input("notes", sql.NVarChar(500), supervisorNotes ?? null)
        .query(`
          UPDATE trx_validation_request SET
            status = @status,
            supervisor_notes = @notes,
            decision_date = GETDATE()
          WHERE request_id = @requestId
        `)

      // Map to skill_progress status
      const progressStatus =
        status === "approved"          ? "approved" :
        status === "revision_required" ? "on_progress" :
        /* rejected */                  "not_competent"

      // Update skill progress
      await new sql.Request(transaction)
        .input("employeeId", sql.Int, employee_id)
        .input("skillId", sql.Int, skill_id)
        .input("progressStatus", sql.VarChar(50), progressStatus)
        .query(`
          IF EXISTS (SELECT 1 FROM trx_skill_progress WHERE employee_id = @employeeId AND skill_id = @skillId)
            UPDATE trx_skill_progress SET status = @progressStatus, updated_at = GETDATE()
            WHERE employee_id = @employeeId AND skill_id = @skillId
          ELSE
            INSERT INTO trx_skill_progress (employee_id, skill_id, status)
            VALUES (@employeeId, @skillId, @progressStatus)
        `)

      await transaction.commit()
      return NextResponse.json({ success: true })
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  } catch (error) {
    console.error("PUT /api/validation-requests/[id] error:", error)
    return NextResponse.json({ error: "Failed to update validation request" }, { status: 500 })
  }
}
