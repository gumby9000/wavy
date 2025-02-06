import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
    const {layerName, temporalType, timePeriod} = req.query;
   
    if(req.method == 'GET') {
        const {layerName, temporalType, timePeriod} = req.query;
        try {
            const {data, error} = await supabase
                .from('static_layers')
                .select('geojson')
                .match({
                    layerName: layerName,
                    temporalType: temporalType,
                    timePeriod: timePeriod
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
    else if (req.method == 'POST') {
        try {
            const { layerName, temporalType, timePeriod, geojsonData} = req.body

            const { data, error} = await supabase
                .from('static_layers')
                .insert({
                    layerName: layerName,
                    temporalType: temporalType,
                    timePeriod: timePeriod,
                    geojsonData: geojsonData
                })
                .select()
            
            if (error) throw error
            
            res.status(200).json({success: true, data})
        }
        catch (error) {
        console.error('Error uploading layer: ', error);
        res.status(500).json({error: error.message});
        }
    }
    
    else {
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).json({error: `Method ${req.method} not allowed`})
    }
}