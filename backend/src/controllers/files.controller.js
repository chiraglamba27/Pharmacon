import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { createAuditLog } from '../services/AuditService.js';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_DELIVERABLE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint'];
const ALLOWED_PRESCRIPTION_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf'];

export async function uploadDeliverableFile(req, res, next) {
  try {
    const file = req.file;
    if (!file) throw new AppError('File is required', 400);
    if (!ALLOWED_DELIVERABLE_TYPES.includes(file.mimetype)) {
      throw new AppError('Invalid file type. Allowed: PDF, PPTX, PPT', 400);
    }

    const fileId = uuidv4();
    const ext = file.originalname.split('.').pop();
    const storagePath = `deliverables/${fileId}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('public-deliverables')
      .upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });
    if (uploadError) throw new AppError(`Storage upload failed: ${uploadError.message}`, 500);

    const { data, error } = await supabaseAdmin.from('file_assets').insert({
      id: fileId,
      bucket: 'public-deliverables',
      storage_path: storagePath,
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
      visibility: 'public',
      uploaded_by: req.user.id,
    }).select().single();
    if (error) throw new AppError(error.message, 500);

    createAuditLog({ actor_user_id: req.user.id, action: 'FILE_UPLOADED', entity_type: 'file_asset', entity_id: fileId, metadata: { bucket: 'public-deliverables' } });
    res.status(201).json({ data });
  } catch (err) { next(err); }
}

export async function uploadPrescriptionFile(req, res, next) {
  try {
    const file = req.file;
    if (!file) throw new AppError('File is required', 400);
    if (!ALLOWED_PRESCRIPTION_TYPES.includes(file.mimetype)) {
      throw new AppError('Invalid file type. Allowed: JPEG, PNG, WebP, TIFF, PDF', 400);
    }

    const fileId = uuidv4();
    const ext = file.originalname.split('.').pop();
    const storagePath = `prescriptions/${fileId}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('private-prescriptions')
      .upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });
    if (uploadError) throw new AppError(`Storage upload failed: ${uploadError.message}`, 500);

    const { data, error } = await supabaseAdmin.from('file_assets').insert({
      id: fileId,
      bucket: 'private-prescriptions',
      storage_path: storagePath,
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
      visibility: 'private',
      uploaded_by: req.user.id,
    }).select().single();
    if (error) throw new AppError(error.message, 500);

    createAuditLog({ actor_user_id: req.user.id, action: 'FILE_UPLOADED', entity_type: 'file_asset', entity_id: fileId, metadata: { bucket: 'private-prescriptions' } });
    res.status(201).json({ data });
  } catch (err) { next(err); }
}

export async function getSignedUrl(req, res, next) {
  try {
    const { fileAssetId } = req.params;
    const { data: asset, error } = await supabaseAdmin
      .from('file_assets').select('bucket, storage_path, visibility').eq('id', fileAssetId).single();
    if (error || !asset) throw new AppError('File not found', 404);

    if (asset.visibility === 'private' && !['admin', 'doctor', 'clinic_staff', 'pharmacist'].includes(req.user.role)) {
      throw new AppError('Access denied', 403);
    }

    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from(asset.bucket).createSignedUrl(asset.storage_path, 300);
    if (signError) throw new AppError('Could not generate URL', 500);

    res.json({ data: { url: signed.signedUrl, expires_in: 300 } });
  } catch (err) { next(err); }
}

export async function listFileAssets(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('file_assets').select('*').order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function deleteFileAsset(req, res, next) {
  try {
    const { id } = req.params;
    const { data: asset, error } = await supabaseAdmin
      .from('file_assets').select('bucket, storage_path').eq('id', id).single();
    if (error || !asset) throw new AppError('File not found', 404);

    await supabaseAdmin.storage.from(asset.bucket).remove([asset.storage_path]);
    await supabaseAdmin.from('file_assets').delete().eq('id', id);

    createAuditLog({ actor_user_id: req.user.id, action: 'FILE_DELETED', entity_type: 'file_asset', entity_id: id });
    res.json({ message: 'File deleted' });
  } catch (err) { next(err); }
}
