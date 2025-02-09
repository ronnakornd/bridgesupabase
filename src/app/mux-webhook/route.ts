import { supabase } from '@/libs/supabase/client'

export async function POST(request: Request) {
    const body = await request.json();
    const { type, data } = body
  
    if (type === 'video.asset.ready') {
        const { id, status } = data;
        if (status === 'ready') {
            // Update the video asset in your database
            const { data: video, error } = await supabase
            .from('videos')
            .update({ status: 'ready' })
            .eq('mux_asset_id', id)
            if (error) {
            console.error('Error updating video:', error.message)
            return Response.json({ message: 'error' }, { status: 500 })
            }
        }

    } else {
      /* handle other event types */

      
    }
    return Response.json({ message: 'ok' });
  }