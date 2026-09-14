import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export async function getTeam(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw new AppError(error.message, 500);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function getRoadmap(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('project_milestones')
      .select('*')
      .order('target_date', { ascending: true });
    if (error) throw new AppError(error.message, 500);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function getOverview(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('project_pages')
      .select('*')
      .eq('slug', 'overview')
      .single();
    if (error) throw new AppError(error.message, 500);
    res.json({ data });
  } catch (err) { next(err); }
}
