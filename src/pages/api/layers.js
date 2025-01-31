import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
    const {layer_name, temporal_type, time_period} = req.query;
    
    try {
        const {data, error} = await supabase
            .from('static_layers')
            .select('geojson')
            .match({
                layer_name: layer_name,
                temporal_type: temporal_type,
                time_period: time_period
            })
            .single();
        
        if(error) throw error;
        if(!data) {
            return res.status(404).json({error: 'Layer not found'});
        }
        
        res.status(200).json({error: 'Layer not found'});
    } catch (error) {
        console.error('Error fetching layer:', error);
        res.status(500).json({error: error.message});
    }
}