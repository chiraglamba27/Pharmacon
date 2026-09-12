import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Filter, Flag } from 'lucide-react';

export interface GanttTask {
  id: string;
  name: string;
  phase: string;
  assignee: string;
  startWeek: number;
  durationWeeks: number;
  progress: number;
  dependencies?: string[];
  isMilestone?: boolean;
  status: 'completed' | 'in-progress' | 'planned';
}

const DEFAULT_TASKS: GanttTask[] = [
  {
    id: 'T1',
    name: 'Project Inception & Planning Deck v1',
    phase: 'Phase 0: Planning & Setup',
    assignee: 'All Team',
    startWeek: 1,
    durationWeeks: 2,
    progress: 100,
    isMilestone: true,
    status: 'completed',
  },
  {
    id: 'T2',
    name: 'Doctor Writer Recruitment & Calibration Sheets',
    phase: 'Phase 0: Planning & Setup',
    assignee: 'Amitesh / Aryan',
    startWeek: 2,
    durationWeeks: 3,
    progress: 80,
    dependencies: ['T1'],
    status: 'in-progress',
  },
  {
    id: 'T3',
    name: 'Frontend Shell & Component Architecture',
    phase: 'Phase 1: Architecture & UI',
    assignee: 'Aryan Sharma',
    startWeek: 2,
    durationWeeks: 3,
    progress: 100,
    status: 'completed',
  },
  {
    id: 'T4',
    name: 'Supabase Backend, Auth & Storage Setup',
    phase: 'Phase 1: Architecture & UI',
    assignee: 'Aniket Raj',
    startWeek: 3,
    durationWeeks: 3,
    progress: 90,
    dependencies: ['T1'],
    status: 'in-progress',
  },
  {
    id: 'T5',
    name: 'Handwriting Recognition Baseline Model',
    phase: 'Phase 2: AI / CV Engine',
    assignee: 'Amitesh Kumar Singh',
    startWeek: 4,
    durationWeeks: 4,
    progress: 40,
    dependencies: ['T2'],
    status: 'in-progress',
  },
  {
    id: 'T6',
    name: 'Doctor-Specific Adaptation Fine-Tuning Loop',
    phase: 'Phase 2: AI / CV Engine',
    assignee: 'Amitesh Kumar Singh',
    startWeek: 6,
    durationWeeks: 4,
    progress: 15,
    dependencies: ['T5'],
    status: 'planned',
  },
  {
    id: 'T7',
    name: 'Confidence Scoring & Verification Review Flow',
    phase: 'Phase 3: Verification & Portals',
    assignee: 'Aryan / Aniket',
    startWeek: 6,
    durationWeeks: 3,
    progress: 30,
    dependencies: ['T4'],
    status: 'planned',
  },
  {
    id: 'T8',
    name: 'Milestone 1: Mid-Semester Prototype & Evaluation',
    phase: 'Milestone Deliverable',
    assignee: 'All Team',
    startWeek: 8,
    durationWeeks: 1,
    progress: 0,
    isMilestone: true,
    dependencies: ['T5', 'T7'],
    status: 'planned',
  },
  {
    id: 'T9',
    name: 'Formulary & Inventory SKU Matching Engine',
    phase: 'Phase 4: Integrations',
    assignee: 'Chirag Lamba',
    startWeek: 8,
    durationWeeks: 3,
    progress: 0,
    dependencies: ['T8'],
    status: 'planned',
  },
  {
    id: 'T10',
    name: 'Multi-Tenant Clinic, Pharmacy & Patient Portals',
    phase: 'Phase 4: Integrations',
    assignee: 'Aryan / Aniket',
    startWeek: 9,
    durationWeeks: 3,
    progress: 0,
    dependencies: ['T7'],
    status: 'planned',
  },
  {
    id: 'T11',
    name: 'End-to-End System Testing & Security Audit',
    phase: 'Phase 5: Evaluation & Hardening',
    assignee: 'Chirag Lamba',
    startWeek: 11,
    durationWeeks: 2,
    progress: 0,
    dependencies: ['T9', 'T10'],
    status: 'planned',
  },
  {
    id: 'T12',
    name: 'Final Demonstration, Report & Deployment v3',
    phase: 'Milestone Deliverable',
    assignee: 'All Team',
    startWeek: 13,
    durationWeeks: 2,
    progress: 0,
    isMilestone: true,
    dependencies: ['T11'],
    status: 'planned',
  },
];

const TOTAL_WEEKS = 14;
const WEEKS = Array.from({ length: TOTAL_WEEKS }, (_, i) => `W${i + 1}`);

export default function GanttChart() {
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);

  const phases = ['all', ...Array.from(new Set(DEFAULT_TASKS.map((t) => t.phase)))];

  const filteredTasks = filterPhase === 'all'
    ? DEFAULT_TASKS
    : DEFAULT_TASKS.filter((t) => t.phase === filterPhase);

  const getStatusColor = (status: GanttTask['status'], isMilestone?: boolean) => {
    if (isMilestone) return 'bg-primary-600 text-white shadow-sm';
    switch (status) {
      case 'completed': return 'bg-emerald-500 text-white';
      case 'in-progress': return 'bg-blue-500 text-white';
      case 'planned': return 'bg-slate-200 text-slate-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="card p-6 overflow-hidden">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Semester Project Roadmap & Gantt Schedule
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            14-week timeline detailing task dependencies, technical milestones, and team allocations.
          </p>
        </div>

        {/* Phase Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterPhase}
            onChange={(e) => setFilterPhase(e.target.value)}
            className="input-field text-xs py-1.5 px-3 rounded-md"
          >
            {phases.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All Phases' : p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 py-3 text-xs text-slate-600 border-b border-slate-100 bg-slate-50/50 -mx-6 px-6">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-200 inline-block" />
          <span>Planned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flag className="w-3.5 h-3.5 text-primary-600" />
          <span>Key Milestone</span>
        </div>
      </div>

      {/* Gantt Grid View */}
      <div className="overflow-x-auto pt-4 -mx-6 px-6">
        <div className="min-w-[760px]">
          {/* Header Row: Weeks */}
          <div className="grid grid-cols-12 gap-1 pb-2 border-b border-slate-100 text-center">
            <div className="col-span-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pl-2">
              Task & Assignee
            </div>
            <div className="col-span-8 grid grid-cols-14 gap-1 text-[11px] font-mono text-slate-500 font-medium">
              {WEEKS.map((w, idx) => (
                <div key={w} className={`py-1 rounded ${idx === 0 || idx === 1 ? 'bg-primary-50 text-primary-700 font-bold' : ''}`}>
                  {w}
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-slate-100 py-2 space-y-1">
            {filteredTasks.map((task) => {
              const startCol = task.startWeek;
              const span = task.durationWeeks;

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`grid grid-cols-12 gap-1 py-2.5 items-center hover:bg-slate-50 rounded-lg px-2 cursor-pointer transition-colors ${
                    selectedTask?.id === task.id ? 'bg-primary-50/70 ring-1 ring-primary-500' : ''
                  }`}
                >
                  {/* Task Name & Assignee */}
                  <div className="col-span-4 pr-2">
                    <div className="flex items-center gap-1.5">
                      {task.isMilestone ? (
                        <Flag className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                      ) : task.status === 'completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      )}
                      <span className={`text-xs font-medium truncate ${task.isMilestone ? 'font-bold text-primary-900' : 'text-slate-800'}`}>
                        {task.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 pl-5">
                      <span className="font-medium">{task.assignee}</span>
                      {task.dependencies && (
                        <span>· Dep: {task.dependencies.join(', ')}</span>
                      )}
                    </div>
                  </div>

                  {/* Gantt Bar */}
                  <div className="col-span-8 grid grid-cols-14 gap-1 items-center relative h-6 bg-slate-100/70 rounded p-0.5">
                    <div
                      style={{
                        gridColumnStart: startCol,
                        gridColumnEnd: `span ${span}`,
                      }}
                      className={`h-5 rounded px-2 flex items-center justify-between text-[10px] font-medium transition-all ${getStatusColor(
                        task.status,
                        task.isMilestone
                      )}`}
                    >
                      <span className="truncate">{task.progress}%</span>
                      {task.isMilestone && <span className="text-[8px] uppercase tracking-wider">Milestone</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Task Drawer */}
      {selectedTask && (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-primary text-[10px]">{selectedTask.phase}</span>
              <h4 className="font-semibold text-xs text-slate-900">{selectedTask.name}</h4>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Assigned to <strong>{selectedTask.assignee}</strong> · Timeline: Week {selectedTask.startWeek} to Week {selectedTask.startWeek + selectedTask.durationWeeks - 1} (Progress: {selectedTask.progress}%)
            </p>
          </div>
          <button
            onClick={() => setSelectedTask(null)}
            className="btn-secondary text-xs py-1 px-3"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
