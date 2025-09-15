import sql from "@/app/api/utils/sql";

// Get current scheduler state
export async function GET() {
  try {
    const [state] = await sql`
      SELECT * FROM scheduler_state WHERE id = 1
    `;
    
    const [settings] = await sql`
      SELECT * FROM scheduler_settings WHERE id = 1
    `;
    
    const [callStatus] = await sql`
      SELECT * FROM call_status WHERE id = 1
    `;
    
    const logs = await sql`
      SELECT * FROM activity_logs 
      ORDER BY timestamp DESC 
      LIMIT 50
    `;
    
    return Response.json({
      state: state || {
        current_hour: 19,
        current_minute: 30,
        schedule_started: false,
        media_allowed: false,
        start_time: null
      },
      settings: settings || {
        foh_enabled: true,
        backstage_enabled: true,
        foh_volume: 0.8,
        backstage_volume: 0.8
      },
      callStatus: {
        fohCalls: JSON.parse(callStatus?.foh_calls || '[]'),
        backstageCalls: JSON.parse(callStatus?.backstage_calls || '[]')
      },
      logs: logs.map(log => ({
        id: log.id,
        message: log.message,
        timestamp: log.timestamp,
        type: log.log_type
      }))
    });
  } catch (error) {
    console.error('Error getting scheduler state:', error);
    return Response.json({ error: 'Failed to get state' }, { status: 500 });
  }
}

// Update scheduler state
export async function PUT(request) {
  try {
    const body = await request.json();
    const { state, settings, callStatus } = body;
    
    if (state) {
      await sql`
        UPDATE scheduler_state 
        SET 
          current_hour = COALESCE(${state.current_hour}, current_hour),
          current_minute = COALESCE(${state.current_minute}, current_minute),
          schedule_started = COALESCE(${state.schedule_started}, schedule_started),
          media_allowed = COALESCE(${state.media_allowed}, media_allowed),
          start_time = COALESCE(${state.start_time}, start_time),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `;
    }
    
    if (settings) {
      await sql`
        UPDATE scheduler_settings 
        SET 
          foh_enabled = COALESCE(${settings.foh_enabled}, foh_enabled),
          backstage_enabled = COALESCE(${settings.backstage_enabled}, backstage_enabled),
          foh_volume = COALESCE(${settings.foh_volume}, foh_volume),
          backstage_volume = COALESCE(${settings.backstage_volume}, backstage_volume),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `;
    }
    
    if (callStatus) {
      await sql`
        UPDATE call_status 
        SET 
          foh_calls = COALESCE(${JSON.stringify(callStatus.fohCalls)}, foh_calls),
          backstage_calls = COALESCE(${JSON.stringify(callStatus.backstageCalls)}, backstage_calls),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `;
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating scheduler state:', error);
    return Response.json({ error: 'Failed to update state' }, { status: 500 });
  }
}