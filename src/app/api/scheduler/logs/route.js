import sql from "@/app/api/utils/sql";

// Add new log entry
export async function POST(request) {
  try {
    const body = await request.json();
    const { message, type = 'info' } = body;
    
    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }
    
    const [log] = await sql`
      INSERT INTO activity_logs (message, log_type)
      VALUES (${message}, ${type})
      RETURNING *
    `;
    
    return Response.json({
      id: log.id,
      message: log.message,
      timestamp: log.timestamp,
      type: log.log_type
    });
  } catch (error) {
    console.error('Error adding log:', error);
    return Response.json({ error: 'Failed to add log' }, { status: 500 });
  }
}

// Clear all logs
export async function DELETE() {
  try {
    await sql`DELETE FROM activity_logs`;
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error clearing logs:', error);
    return Response.json({ error: 'Failed to clear logs' }, { status: 500 });
  }
}