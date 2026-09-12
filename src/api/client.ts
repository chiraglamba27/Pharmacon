import { v4 as uuidv4 } from 'uuid';
import { supabase, STORAGE_BUCKET, getStoragePublicUrl } from '../lib/supabaseClient';

const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
]);

const MAX_FILE_SIZE = 100 * 1024 * 1024;

export interface ApiUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

async function currentUser(): Promise<ApiUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, name, role')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return profile as ApiUser;
}

async function requireUser(): Promise<ApiUser> {
  const user = await currentUser();
  if (!user) throw new Error('Authentication required');
  return user;
}

function storageFilePath(userId: string, originalName: string): string {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^\.+/, '');
  return `${userId}/${uuidv4()}-${safeName || 'file'}`;
}

function normalizeVersion(row: any) {
  return {
    ...row,
    changeSummary: row.change_summary,
    commitRef: row.commit_ref,
    deploymentUrl: row.deployment_url,
    parentVersionId: row.parent_version_id,
  };
}

function normalizeDeliverable(row: any) {
  return {
    ...row,
    versionId: row.version_id,
    versionName: row.version_name,
    fileName: row.file_name,
    fileUrl: row.file_url,
  };
}

async function assertSuccess<T>(result: { data: T; error: any }): Promise<NonNullable<T>> {
  if (result.error) throw result.error;
  if (result.data == null) throw new Error('Supabase returned no data');
  return result.data as NonNullable<T>;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body && !(options.body instanceof FormData) ? JSON.parse(String(options.body)) : undefined;

  if (endpoint === '/auth/login' && method === 'POST') {
    const username = String(body?.username || '').trim().toLowerCase();
    const password = String(body?.password || '');
    if (!username || !password) throw new Error('Username and password are required');

    const email = `${username}@pharmacon.local`;
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw new Error('Invalid username or password');
    const user = await currentUser();
    if (!user) throw new Error('Authenticated user profile is missing');
    return { token: (await supabase.auth.getSession()).data.session?.access_token || '', user } as T;
  }

  if (endpoint === '/auth/me' && method === 'GET') {
    const user = await requireUser();
    return { user } as T;
  }

  if (endpoint === '/team' && method === 'GET') {
    const rows = await assertSuccess(await supabase.from('team_members').select('*').order('created_at', { ascending: true }));
    return { members: rows || [] } as T;
  }

  if (endpoint.startsWith('/team/') && method === 'PUT') {
    await requireUser();
    const id = endpoint.split('/')[2];
    const payload = {
      id,
      name: body?.name,
      role: body?.role,
      focus: body?.focus,
      skills: body?.skills,
      avatar: body?.avatar,
      github_url: body?.github_url ?? body?.githubUrl,
      linkedin_url: body?.linkedin_url ?? body?.linkedinUrl,
      avatar_file_id: body?.avatar_file_id ?? body?.avatarFileId,
    };
    const filtered = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
    const row = await assertSuccess(await supabase.from('team_members').update(filtered).eq('id', id).select('*').single());
    return { member: row } as T;
  }

  if (endpoint === '/versions' && method === 'GET') {
    const rows = await assertSuccess(await supabase.from('versions').select('*').order('created_at', { ascending: false }));
    return { versions: (rows || []).map(normalizeVersion) } as T;
  }

  if (endpoint === '/versions' && method === 'POST') {
    await requireUser();
    const status = body?.status || 'current';
    if (status === 'current') {
      await assertSuccess(await supabase.rpc('set_current_version', { target_id: body?.id || `V-${uuidv4().slice(0, 8)}` }));
    }
    const id = body?.id || `V-${uuidv4().slice(0, 8)}`;
    const row = await assertSuccess(await supabase.from('versions').upsert({
      id,
      name: body.name,
      date: body.date,
      authors: body.authors || 'Team Pharmacon',
      status,
      change_summary: body.changeSummary ?? body.change_summary ?? '',
      commit_ref: body.commitRef ?? body.commit_ref ?? '',
      deployment_url: body.deploymentUrl ?? body.deployment_url ?? '',
      parent_version_id: body.parentVersionId ?? body.parent_version_id ?? null,
    }, { onConflict: 'id' }).select('*').single());
    return { version: normalizeVersion(row) } as T;
  }

  if (endpoint.startsWith('/versions/') && method === 'PUT') {
    await requireUser();
    const id = endpoint.split('/')[2];
    if (body?.status === 'current') {
      await assertSuccess(await supabase.rpc('set_current_version', { target_id: id }));
    }
    const patch = {
      ...(body?.name !== undefined ? { name: body.name } : {}),
      ...(body?.date !== undefined ? { date: body.date } : {}),
      ...(body?.authors !== undefined ? { authors: body.authors } : {}),
      ...(body?.status !== undefined ? { status: body.status } : {}),
      ...(body?.changeSummary !== undefined || body?.change_summary !== undefined ? { change_summary: body.changeSummary ?? body.change_summary } : {}),
      ...(body?.commitRef !== undefined || body?.commit_ref !== undefined ? { commit_ref: body.commitRef ?? body.commit_ref } : {}),
      ...(body?.deploymentUrl !== undefined || body?.deployment_url !== undefined ? { deployment_url: body.deploymentUrl ?? body.deployment_url } : {}),
    };
    const row = await assertSuccess(await supabase.from('versions').update(patch).eq('id', id).select('*').single());
    return { version: normalizeVersion(row) } as T;
  }

  if (endpoint === '/deliverables' && method === 'GET') {
    const rows = await assertSuccess(await supabase
      .from('deliverables')
      .select('*, versions(name, status)')
      .order('created_at', { ascending: false }));
    return {
      deliverables: (rows || []).map((row: any) => normalizeDeliverable({
        ...row,
        version_name: row.versions?.name || row.version_name || '',
        version_status: row.versions?.status || '',
      })),
    } as T;
  }

  if (endpoint === '/deliverables' && method === 'POST') {
    await requireUser();
    const id = body?.id || `D-${uuidv4().slice(0, 8)}`;
    let versionName = body?.versionName ?? body?.version_name ?? '';
    if (body?.versionId || body?.version_id) {
      const version = await assertSuccess(await supabase.from('versions').select('name').eq('id', body.versionId ?? body.version_id).single());
      versionName = version.name;
    }
    const fileId = body?.fileId ?? body?.file_id ?? null;
    let fileName = body?.fileName ?? body?.file_name ?? null;
    let fileUrl = body?.fileUrl ?? body?.file_url ?? null;
    if (fileId) {
      const file = await assertSuccess(await supabase.from('files').select('original_name, file_url').eq('id', fileId).single());
      fileName = file.original_name;
      fileUrl = file.file_url;
    }
    const row = await assertSuccess(await supabase.from('deliverables').upsert({
      id,
      title: body.title,
      type: body.type,
      version_id: body.versionId ?? body.version_id ?? null,
      version_name: versionName,
      date: body.date,
      status: body.status || 'published',
      description: body.description || '',
      file_id: fileId,
      file_name: fileName,
      file_url: fileUrl,
      authors: body.authors || 'Team Pharmacon',
    }, { onConflict: 'id' }).select('*').single());
    return { deliverable: normalizeDeliverable(row) } as T;
  }

  if (endpoint.startsWith('/deliverables/') && method === 'GET') {
    const id = endpoint.split('/')[2];
    const row = await assertSuccess(await supabase.from('deliverables').select('*, versions(name, status, date, authors, change_summary)').eq('id', id).single());
    const history = await assertSuccess(await supabase.from('deliverables').select('id, title, date, status, version_name').neq('id', id).order('created_at', { ascending: false }));
    const d: any = {
      ...row,
      file_id: row.file_id,
      file_name: row.file_name,
      file_url: row.file_url,
      version_name: row.versions?.name || row.version_name,
      version_status: row.versions?.status || null,
      version_date: row.versions?.date || null,
      version_authors: row.versions?.authors || null,
      version_change_summary: row.versions?.change_summary || null,
    };
    return { deliverable: d, history: history || [] } as T;
  }

  if (endpoint.startsWith('/deliverables/') && method === 'PUT') {
    await requireUser();
    const id = endpoint.split('/')[2];
    const versionId = body?.versionId ?? body?.version_id;
    let versionName = body?.versionName ?? body?.version_name;
    if (versionId) {
      const version = await assertSuccess(await supabase.from('versions').select('name').eq('id', versionId).single());
      versionName = version.name;
    }
    const patch: any = {
      ...(body?.title !== undefined ? { title: body.title } : {}),
      ...(body?.type !== undefined ? { type: body.type } : {}),
      ...(versionId !== undefined ? { version_id: versionId, version_name: versionName || '' } : {}),
      ...(body?.date !== undefined ? { date: body.date } : {}),
      ...(body?.status !== undefined ? { status: body.status } : {}),
      ...(body?.description !== undefined ? { description: body.description } : {}),
    };
    if (body?.fileId !== undefined || body?.file_id !== undefined) {
      const fileId = body.fileId ?? body.file_id;
      patch.file_id = fileId;
      if (fileId) {
        const file = await assertSuccess(await supabase.from('files').select('original_name, file_url').eq('id', fileId).single());
        patch.file_name = file.original_name;
        patch.file_url = file.file_url;
      } else {
        patch.file_name = null;
        patch.file_url = null;
      }
    }
    const row = await assertSuccess(await supabase.from('deliverables').update(patch).eq('id', id).select('*').single());
    return { deliverable: normalizeDeliverable(row) } as T;
  }

  if (endpoint.startsWith('/deliverables/') && method === 'DELETE') {
    await requireUser();
    const id = endpoint.split('/')[2];
    await assertSuccess(await supabase.from('deliverables').delete().eq('id', id));
    return { success: true } as T;
  }

  if (endpoint === '/inventory' && method === 'GET') {
    const rows = await assertSuccess(await supabase.from('inventory_items').select('*').order('medicine'));
    return {
      items: (rows || []).map((row: any) => ({
        ...row,
        dosageForm: row.dosage_form,
        packSize: row.pack_size,
        reorderLevel: row.reorder_level,
        lastUpdated: row.updated_at,
        status: row.stock === 0 ? 'out-of-stock' : row.stock <= row.reorder_level ? 'low-stock' : 'in-stock',
      })),
    } as T;
  }

  if (endpoint === '/audit' && method === 'GET') {
    const rows = await assertSuccess(await supabase.from('audit_events').select('*').order('created_at', { ascending: false }).limit(100));
    return {
      events: (rows || []).map((row: any) => ({
        id: row.id,
        timestamp: row.created_at,
        user: row.actor,
        role: row.role,
        action: row.action,
        entity: row.entity,
        entityId: row.entity_id,
        status: row.status,
        details: row.details,
      })),
    } as T;
  }

  if (endpoint.startsWith('/prescriptions/') && method === 'GET') {
    const patientId = endpoint.split('/')[2];
    const prescriptions = await assertSuccess(await supabase.from('prescriptions').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }));
    const ids = (prescriptions || []).map((p: any) => p.id);
    const fields = ids.length ? await assertSuccess(await supabase.from('prescription_fields').select('prescription_id, label, value, confidence, needs_verification').in('prescription_id', ids)) : [];
    const result = (prescriptions || []).map((p: any) => ({
      ...p,
      fields: (fields || []).filter((f: any) => f.prescription_id === p.id),
    }));
    return { prescriptions: result } as T;
  }

  if (endpoint === '/prescriptions/confirm-sample' && method === 'POST') {
    await requireUser();
    const result = await assertSuccess(await supabase.rpc('confirm_sample_prescription'));
    return result as T;
  }

  if (endpoint === '/refills' && method === 'GET') {
    const rows = await assertSuccess(await supabase.from('refill_requests').select('*').order('requested_at', { ascending: false }));
    return {
      refills: (rows || []).map((row: any) => ({
        ...row,
        prescriptionId: row.prescription_id,
        patientId: row.patient_id,
        patientName: row.patient_name,
        requestDate: row.requested_at,
        updatedAt: row.updated_at,
      })),
    } as T;
  }

  if (endpoint === '/refills' && method === 'POST') {
    const user = await requireUser();
    const id = `RF-${uuidv4().slice(0, 8)}`;
    const row = await assertSuccess(await supabase.from('refill_requests').insert({
      id,
      prescription_id: 'RX-2024-0001',
      patient_id: user.id,
      patient_name: user.name,
      medicine: 'Amoxicillin',
      strength: '500 mg',
      status: 'pending',
    }).select('id').single());
    return { id: row.id } as T;
  }

  if (endpoint.startsWith('/refills/') && method === 'PUT') {
    const user = await requireUser();
    const id = endpoint.split('/')[2];
    const status = body?.status;
    if (!['approved', 'rejected', 'contacted'].includes(status)) throw new Error('Invalid refill status');
    await assertSuccess(await supabase.from('refill_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id));
    await supabase.from('audit_events').insert({
      id: `AE-${uuidv4().slice(0, 8)}`,
      actor: user.name,
      role: user.role,
      action: `Refill ${status}`,
      entity: 'Refill',
      entity_id: id,
      status: 'success',
      details: '',
    });
    return { success: true } as T;
  }

  if (endpoint === '/files' && method === 'GET') {
    await requireUser();
    const rows = await assertSuccess(await supabase.from('files').select('id, filename, original_name, mime_type, size, uploaded_by, created_at, file_url, profiles(name)').order('created_at', { ascending: false }));
    return {
      files: (rows || []).map((row: any) => ({
        ...row,
        uploader_name: row.profiles?.name || '',
      })),
    } as T;
  }

  if (endpoint === '/files/upload' && method === 'POST') {
    const user = await requireUser();
    if (!(options.body instanceof FormData)) throw new Error('Invalid upload request');
    const files = Array.from(options.body.getAll('files')).filter((entry): entry is File => entry instanceof File);
    if (!files.length) throw new Error('No files provided');
    if (files.length > 20) throw new Error('Maximum 20 files per upload');

    const uploaded = [] as any[];
    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.has(file.type)) throw new Error(`File type ${file.type || 'unknown'} is not allowed`);
      if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name} exceeds the 100 MB limit`);
      const path = storageFilePath(user.id, file.name);
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream',
      });
      if (uploadError) throw uploadError;
      const id = `F-${uuidv4().slice(0, 8)}`;
      const row = await assertSuccess(await supabase.from('files').insert({
        id,
        filename: path,
        original_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        size: file.size,
        storage_path: path,
        file_url: getStoragePublicUrl(path),
        uploaded_by: user.id,
      }).select('id, filename, original_name, mime_type, size, uploaded_by, created_at, file_url').single());
      uploaded.push({
        id: row.id,
        filename: row.filename,
        originalName: row.original_name,
        mimeType: row.mime_type,
        size: row.size,
        fileUrl: row.file_url,
        uploadedBy: user.name,
        createdAt: row.created_at,
      });
    }
    return { files: uploaded } as T;
  }

  if (endpoint.startsWith('/files/') && method === 'DELETE') {
    await requireUser();
    const id = endpoint.split('/')[2];
    const file = await assertSuccess(await supabase.from('files').select('storage_path').eq('id', id).single());
    await assertSuccess(await supabase.from('files').delete().eq('id', id));
    if (file?.storage_path) {
      const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([file.storage_path]);
      if (error) throw error;
    }
    await supabase.from('deliverables').update({ file_id: null, file_name: null, file_url: null }).eq('file_id', id);
    return { success: true } as T;
  }

  if (endpoint.startsWith('/content/page/') && method === 'GET') {
    const page = endpoint.split('/')[3];
    const rows = await assertSuccess(await supabase.from('page_content').select('section, items').eq('page', page));
    const sections: Record<string, any[]> = {};
    for (const row of rows || []) sections[row.section] = row.items || [];
    return { sections } as T;
  }

  if (endpoint.startsWith('/content/page/') && method === 'PUT') {
    await requireUser();
    const [, , , page, section] = endpoint.split('/');
    const items = body?.items;
    if (!Array.isArray(items)) throw new Error('items must be an array');
    const row = await assertSuccess(await supabase.from('page_content').upsert({
      id: `PC-${uuidv4().slice(0, 8)}`,
      page,
      section,
      items,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'page,section' }).select('*').single());
    return { success: true, content: row } as T;
  }

  if (endpoint === '/content/decks' && method === 'GET') {
    const rows = await assertSuccess(await supabase.from('presentation_decks').select('*').order('sort_order', { ascending: true }));
    return { decks: (rows || []).map((row: any) => ({ id: row.id, title: row.title, description: row.description, filePath: row.file_path, sortOrder: row.sort_order })) } as T;
  }

  if (endpoint === '/content/decks' && method === 'POST') {
    await requireUser();
    if (!body?.title || !body?.description) throw new Error('title and description are required');
    const { data: maxRows, error: maxError } = await supabase.from('presentation_decks').select('sort_order').order('sort_order', { ascending: false }).limit(1);
    if (maxError) throw maxError;
    const maxOrder = maxRows?.[0]?.sort_order ?? -1;
    const row = await assertSuccess(await supabase.from('presentation_decks').insert({
      id: `DECK-${uuidv4().slice(0, 8)}`,
      title: body.title,
      description: body.description,
      file_path: body.filePath || '',
      sort_order: maxOrder + 1,
    }).select('*').single());
    return { id: row.id, title: row.title, description: row.description, filePath: row.file_path, sortOrder: row.sort_order } as T;
  }

  if (endpoint.startsWith('/content/decks/') && method === 'PUT') {
    await requireUser();
    const id = endpoint.split('/')[3];
    const row = await assertSuccess(await supabase.from('presentation_decks').update({
      title: body?.title,
      description: body?.description,
      file_path: body?.filePath,
    }).eq('id', id).select('*').single());
    return { success: true, deck: { id: row.id, title: row.title, description: row.description, filePath: row.file_path, sortOrder: row.sort_order } } as T;
  }

  if (endpoint.startsWith('/content/decks/') && method === 'DELETE') {
    await requireUser();
    const id = endpoint.split('/')[3];
    await assertSuccess(await supabase.from('presentation_decks').delete().eq('id', id));
    return { success: true } as T;
  }

  throw new Error(`Unsupported API operation: ${method} ${endpoint}`);
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: data === undefined ? undefined : JSON.stringify(data) }),
  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: data === undefined ? undefined : JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
  upload: <T>(endpoint: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return request<T>(endpoint, { method: 'POST', body: formData });
  },
};

export default api;
