import { createClient } from '@/lib/supabase/server';

async function getRecentActivity() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('activity_logs')
    .select('id, action, entity_type, created_at, actor_role')
    .order('created_at', { ascending: false })
    .limit(8);
  return data || [];
}

export default async function RecentActivity() {
  const activities = await getRecentActivity();

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="font-semibold text-white">Actividad reciente</h3>
      </div>
      <div className="divide-y divide-gray-800">
        {activities.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">Sin actividad todavía.</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="px-5 py-3">
              <p className="text-sm text-gray-300">
                <span className="font-medium text-white">{activity.action}</span>
                {activity.entity_type && (
                  <span className="text-gray-500"> · {activity.entity_type}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(activity.created_at).toLocaleString('es-ES')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
