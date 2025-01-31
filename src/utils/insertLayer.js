import {createClient} from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertLayer(filePath, layerName, temporalType, timePeriod) {
    try {
        const geojsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const {data, error} = await supabase
            .from('static_layers')
            .insert({
                layer_name: layerName,
                temporal_type: temporalType,
                time_period: timePeriod,
                geojson: geojsonData
            })
            .select();
        
        if (error) throw error;

        console.log('successfully inserted layer:', data);
        return data;
    } catch(error) {
        console.error('Error inserting layer:', error);
        throw error;
    }
}

export default insertLayer;