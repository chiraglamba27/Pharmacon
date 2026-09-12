import { api } from '../api/client';

export interface PresentationVersion {
  id: string;
  name: string;
  date: string;
  authors: string;
  status: 'current' | 'archived' | 'future' | 'draft';
  change_summary: string;
  commit_ref?: string;
  deployment_url?: string;
  parent_version_id?: string | null;
  file_url?: string;
  created_at?: string;
}

export interface DeliverableItem {
  id: string;
  title: string;
  type: string;
  version_id?: string;
  version_name?: string;
  date: string;
  status: 'draft' | 'in-progress' | 'published' | 'archived';
  description: string;
  file_name?: string | null;
  file_url?: string | null;
  authors?: string;
  created_at?: string;
}

export const storageService = {
  async getVersions(): Promise<PresentationVersion[]> {
    const result = await api.get<{ versions: PresentationVersion[] }>('/versions');
    return result.versions;
  },

  async publishVersion(version: Omit<PresentationVersion, 'id'> & { id?: string }): Promise<PresentationVersion> {
    const result = await api.post<{ version: PresentationVersion }>('/versions', version);
    return result.version;
  },

  async getDeliverables(): Promise<DeliverableItem[]> {
    const result = await api.get<{ deliverables: DeliverableItem[] }>('/deliverables');
    return result.deliverables;
  },

  async publishDeliverable(item: Omit<DeliverableItem, 'id'> & { id?: string }): Promise<DeliverableItem> {
    const result = await api.post<{ deliverable: DeliverableItem }>('/deliverables', item);
    return result.deliverable;
  },

  async uploadFileToStorage(file: File): Promise<{ fileName: string; fileUrl: string; size: number; id?: string }> {
    const result = await api.upload<{ files: Array<{ id: string; originalName: string; fileUrl: string; size: number }> }>('/files/upload', [file]);
    const uploaded = result.files[0];
    if (!uploaded) throw new Error('Upload failed');
    return { fileName: uploaded.originalName, fileUrl: uploaded.fileUrl, size: uploaded.size, id: uploaded.id };
  },

  async getTeamMembers(): Promise<any[]> {
    const result = await api.get<{ members: any[] }>('/team');
    return result.members;
  },

  async updateTeamMember(memberId: string, memberData: any): Promise<void> {
    await api.put(`/team/${memberId}`, memberData);
  },
};
