import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

// GET /api/validation-requests?employeeId=X   — employee's own requests
// GET /api/validation-requests?supervisorId=X  — supervisor's inbox
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get("employeeId")
    const supervisorId = searchParams.get("supervisorId")

    const pool = await getConnection()

    if (supervisorId) {
      const result = await pool
        .request()
        .input("supervisorId", sql.Int, parseInt(supervisorId))
        .query(`
          SELECT
            vr.request_id,
            vr.employee_id,
            vr.skill_id,
            vr.supervisor_id,
            vr.status,
            vr.request_date,
            vr.decision_date,
            vr.employee_notes,
            vr.supervisor_notes,
            s.skill_name,
            s.skill_code,
            s.description AS skill_description,
            e.name AS employee_name,
            e.job_title AS employee_job_title,
            p.program_name
          FROM trx_validation_request vr
          JOIN mst_skill s ON vr.skill_id = s.skill_id
          JOIN mst_employee e ON vr.employee_id = e.employee_id
          LEFT JOIN mst_program p ON e.program_id = p.program_id
          WHERE vr.supervisor_id = @supervisorId
          ORDER BY
            CASE vr.status WHEN 'pending' THEN 0 WHEN 'revision_required' THEN 1 ELSE 2 END,
            vr.request_date DESC
        `)
      return NextResponse.json(result.recordset.map((r) => ({
        id: r.request_id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        employeeJobTitle: r.employee_job_title ?? "",
        skillId: r.skill_id,
        skillName: r.skill_name,
        skillCode: r.skill_code,
        skillDescription: r.skill_description ?? "",
        programName: r.program_name ?? "",
        status: r.status,
        requestDate: r.request_date,
        decisionDate: r.decision_date,
        employeeNotes: r.employee_notes ?? "",
        supervisorNotes: r.supervisor_notes ?? "",
      })))
    }

    if (employeeId) {
      const result = await pool
        .request()
        .input("employeeId", sql.Int, parseInt(employeeId))
        .query(`
          SELECT
            vr.request_id,
            vr.skill_id,
            vr.status,
            vr.request_date,
            vr.decision_date,
            vr.employee_notes,
            vr.supervisor_notes,
            s.skill_name,
            s.skill_code,
            sup.name AS supervisor_name
          FROM trx_validation_request vr
          JOIN mst_skill s ON vr.skill_id = s.skill_id
          JOIN mst_employee sup ON vr.supervisor_id = sup.employee_id
          WHERE vr.employee_id = @employeeId
          ORDER BY vr.request_date DESC
        `)
      return NextResponse.json(result.recordset.map((r) => ({
        id: r.request_id,
        skillId: r.skill_id,
        skillName: r.skill_name,
        skillCode: r.skill_code,
        supervisorName: r.supervisor_name,
        status: r.status,
        requestDate: r.request_date,
        decisionDate: r.decision_date,
        employeeNotes: r.employee_notes ?? "",
        supervisorNotes: r.supervisor_notes ?? "",
      })))
    }

    return NextResponse.json({ error: "Provide employeeId or supervisorId" }, { status: 400 })
  } catch (error) {
    console.error("GET /api/validation-requests error:", error)
    return NextResponse.json({ error: "Failed to fetch validation requests" }, { status: 500 })
  }
}

// POST /api/validation-requests — employee submits a new (or resubmits a revision) request
export async function POST(req: NextRequest) {
  try {
    const { employeeId, skillId, notes } = await req.json()
    if (!employeeId || !skillId) {
      return NextResponse.json({ error: "employeeId and skillId are required" }, { status: 400 })
    }

    const pool = await getConnection()
    const transaction = new sql.Transaction(pool)
    await transaction.begin()

    try {
      // 1. Get supervisor_id from employee record
      const empResult = await new sql.Request(transaction)
        .input("employeeId", sql.Int, parseInt(employeeId))
        .query(`SELECT supervisor_id FROM mst_employee WHERE employee_id = @employeeId`)

      const supervisorId = empResult.recordset[0]?.supervisor_id
      if (!supervisorId) {
        await transaction.rollback()
        return NextResponse.json(
          { error: "No supervisor assigned. Please contact your administrator." },
          { status: 400 }
        )
      }

      // 2. Block if there is already an active pending or approved request
      const blocking = await new sql.Request(transaction)
        .input("employeeId", sql.Int, parseInt(employeeId))
        .input("skillId", sql.Int, parseInt(skillId))
        .query(`
          SELECT request_id FROM trx_validation_request
          WHERE employee_id = @employeeId AND skill_id = @skillId
            AND status IN ('pending', 'approved')
        `)

      if (blocking.recordset.length > 0) {
        await transaction.rollback()
        return NextResponse.json(
          { error: "An active request already exists for this skill. Wait for the supervisor's decision." },
          { status: 409 }
        )
      }

      // 3. Check for a revision_required request → resubmit (update existing)
      const revisionReq = await new sql.Request(transaction)
        .input("employeeId", sql.Int, parseInt(employeeId))
        .input("skillId", sql.Int, parseInt(skillId))
        .query(`
          SELECT request_id FROM trx_validation_request
          WHERE employee_id = @employeeId AND skill_id = @skillId
            AND status = 'revision_required'
        `)

      let requestId: number

      if (revisionReq.recordset.length > 0) {
        // Resubmit: reset existing request back to pending with updated notes
        const existingId = revisionReq.recordset[0].request_id
        await new sql.Request(transaction)
          .input("requestId", sql.Int, existingId)
          .input("notes", sql.NVarChar(500), notes ?? null)
          .query(`
            UPDATE trx_validation_request SET
              status = 'pending',
              request_date = GETDATE(),
              employee_notes = @notes,
              supervisor_notes = NULL,
              decision_date = NULL
            WHERE request_id = @requestId
          `)
        requestId = existingId
      } else {
        // Brand-new request
        const result = await new sql.Request(transaction)
          .input("employeeId", sql.Int, parseInt(employeeId))
          .input("skillId", sql.Int, parseInt(skillId))
          .input("supervisorId", sql.Int, supervisorId)
          .input("notes", sql.NVarChar(500), notes ?? null)
          .query(`
            INSERT INTO trx_validation_request
              (employee_id, skill_id, supervisor_id, employee_notes, status, request_date)
            OUTPUT INSERTED.request_id
            VALUES (@employeeId, @skillId, @supervisorId, @notes, 'pending', GETDATE())
          `)
        requestId = result.recordset[0].request_id
      }

      // 4. Update (or create) skill_progress → requesting_validation
      await new sql.Request(transaction)
        .input("employeeId", sql.Int, parseInt(employeeId))
        .input("skillId", sql.Int, parseInt(skillId))
        .query(`
          IF EXISTS (SELECT 1 FROM trx_skill_progress WHERE employee_id = @employeeId AND skill_id = @skillId)
            UPDATE trx_skill_progress SET status = 'requesting_validation', updated_at = GETDATE()
            WHERE employee_id = @employeeId AND skill_id = @skillId
          ELSE
            INSERT INTO trx_skill_progress (employee_id, skill_id, status)
            VALUES (@employeeId, @skillId, 'requesting_validation')
        `)

      await transaction.commit()
      return NextResponse.json({ id: requestId }, { status: 201 })
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  } catch (error) {
    console.error("POST /api/validation-requests error:", error)
    return NextResponse.json({ error: "Failed to create validation request" }, { status: 500 })
  }
}
