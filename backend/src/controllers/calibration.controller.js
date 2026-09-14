import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export async function getMyCalibrationProfile(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('doctor_calibration_profiles').select('*').eq('doctor_id', req.user.id).single();
    if (error && error.code !== 'PGRST116') throw new AppError(error.message, 500);
    res.json({ data: data || null, ai_model_status: 'MODEL_INTEGRATION_PENDING' });
  } catch (err) { next(err); }
}

export async function getDoctorCalibrationProfile(req, res, next) {
  try {
    const { doctorId } = req.params;
    const { data, error } = await supabaseAdmin
      .from('doctor_calibration_profiles').select('*, doctor_calibration_samples(*)').eq('doctor_id', doctorId).single();
    if (error && error.code !== 'PGRST116') throw new AppError(error.message, 500);
    res.json({ data: data || null });
  } catch (err) { next(err); }
}

export async function uploadCalibrationSample(req, res, next) {
  try {
    const { file_asset_id, labelled_transcription } = req.body;
    if (!file_asset_id || !labelled_transcription) {
      throw new AppError('file_asset_id and labelled_transcription are required', 400);
    }

    // Upsert calibration profile for this doctor
    await supabaseAdmin.from('doctor_calibration_profiles')
      .upsert({ doctor_id: req.user.id, status: 'COLLECTING_SAMPLES' }, { onConflict: 'doctor_id', ignoreDuplicates: false })
      .select().single();

    const { data, error } = await supabaseAdmin.from('doctor_calibration_samples').insert({
      doctor_id: req.user.id, file_asset_id, labelled_transcription, quality_status: 'PENDING',
    }).select().single();
    if (error) throw new AppError(error.message, 500);

    // Increment sample count
    await supabaseAdmin.rpc('increment_calibration_sample_count', { p_doctor_id: req.user.id });

    res.status(201).json({ data, note: 'Sample uploaded. AI model integration is pending — samples will be used for training once available.' });
  } catch (err) { next(err); }
}

export async function getMySamples(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('doctor_calibration_samples').select('*, file_assets(original_name, mime_type)').eq('doctor_id', req.user.id).order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function verifySample(req, res, next) {
  try {
    const { id } = req.params;
    const { quality_status } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(quality_status)) throw new AppError('Invalid quality_status', 400);

    const { data, error } = await supabaseAdmin
      .from('doctor_calibration_samples').update({ quality_status }).eq('id', id).select().single();
    if (error) throw new AppError(error.message, 500);
    res.json({ data });
  } catch (err) { next(err); }
}
