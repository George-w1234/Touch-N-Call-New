import sql from "@/app/api/utils/sql";

// Trigger manual call
export async function POST(request) {
  try {
    const body = await request.json();
    const { callType, location, message } = body;
    
    if (!callType || !location) {
      return Response.json({ error: 'Call type and location are required' }, { status: 400 });
    }
    
    // Add to activity log
    const logMessage = message || `Manual ${callType} call triggered for ${location}`;
    await sql`
      INSERT INTO activity_logs (message, log_type)
      VALUES (${logMessage}, 'manual')
    `;
    
    // Update call status
    const [currentStatus] = await sql`
      SELECT foh_calls, backstage_calls FROM call_status WHERE id = 1
    `;
    
    const fohCalls = JSON.parse(currentStatus?.foh_calls || '[]');
    const backstageCalls = JSON.parse(currentStatus?.backstage_calls || '[]');
    
    const newCall = {
      type: callType,
      timestamp: new Date().toISOString(),
      manual: true
    };
    
    if (location === 'foh') {
      fohCalls.push(newCall);
      // Keep only last 10 calls
      if (fohCalls.length > 10) fohCalls.shift();
    } else if (location === 'backstage') {
      backstageCalls.push(newCall);
      // Keep only last 10 calls
      if (backstageCalls.length > 10) backstageCalls.shift();
    }
    
    await sql`
      UPDATE call_status 
      SET 
        foh_calls = ${JSON.stringify(fohCalls)},
        backstage_calls = ${JSON.stringify(backstageCalls)},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `;
    
    return Response.json({ 
      success: true,
      message: `${callType} call triggered for ${location}`,
      callAdded: newCall
    });
  } catch (error) {
    console.error('Error triggering call:', error);
    return Response.json({ error: 'Failed to trigger call' }, { status: 500 });
  }
}