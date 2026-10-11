import React, { useState, useEffect } from 'react';
import { Database, Table, RefreshCw, Layers, CheckCircle2, Search, ArrowRight, ShieldCheck, FileText, Activity } from 'lucide-react';
import { api } from '../api/client';

interface TableOverview {
  name: string;
  count: number;
  columns: string[];
}

interface TableData {
  table: string;
  columns: string[];
  rows: any[];
}

export default function DbInspectorPage() {
  const [tables, setTables] = useState<TableOverview[]>([]);
  const [activeTable, setActiveTable] = useState<string>('users');
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbPath, setDbPath] = useState('server/pharmacon.db');
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = () => {
    setLoadingOverview(true);
    setError(null);
    api.get<{ dbPath: string; tables: TableOverview[]; totalRecords: number }>('/db/overview')
      .then((data) => {
        if (data?.tables) {
          setTables(data.tables);
          setDbPath(data.dbPath);
          setTotalRecords(data.totalRecords);
        }
      })
      .catch((err) => {
        console.error('Failed to load DB overview:', err);
        setError(err.message || 'Access Denied: Only Admins can inspect the live database.');
      })
      .finally(() => setLoadingOverview(false));
  };

  const fetchTable = (tableName: string) => {
    setActiveTable(tableName);
    setLoadingTable(true);
    api.get<TableData>(`/db/table/${tableName}`)
      .then((data) => setTableData(data))
      .catch((err) => {
        console.error(`Failed to load ${tableName}:`, err);
        setError(err.message || `Access Denied to table ${tableName}`);
      })
      .finally(() => setLoadingTable(false));
  };

  useEffect(() => {
    fetchOverview();
    fetchTable('users');
  }, []);

  const filteredRows = (tableData?.rows || []).filter((row) => {
    if (!searchTerm.trim()) return true;
    const line = JSON.stringify(row).toLowerCase();
    return line.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="page-container max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-green flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              SQLite Persistent Disk DB
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Admin Only Access
            </span>
            <span className="badge-slate font-mono text-xs">{dbPath}</span>
            <span className="badge-teal">{totalRecords} Live Rows</span>
          </div>
          <h1 className="page-title">Live SQLite Database Inspector</h1>
          <p className="page-subtitle">
            Restricted Admin Diagnostics & Live Table Inspection. Real-time persistent state in SQLite on disk.
          </p>
        </div>

        <button
          onClick={() => {
            fetchOverview();
            fetchTable(activeTable);
          }}
          className="btn-primary"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${(loadingOverview || loadingTable) ? 'animate-spin' : ''}`} />
          Refresh Database
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <div className="font-bold text-rose-800">Database Access Restriction</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Table Selector Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 pb-2">
        {tables.map((t) => (
          <button
            key={t.name}
            onClick={() => fetchTable(t.name)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
              activeTable === t.name
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span className="capitalize">{t.name.replace(/_/g, ' ')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTable === t.name ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table Content Card */}
      <div className="card p-6 mt-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900 capitalize">
                Table: <code className="font-mono text-cyan-700 text-sm font-bold">{activeTable}</code>
              </h2>
              <div className="text-xs text-slate-500">
                Primary key & columns: {tables.find(t => t.name === activeTable)?.columns.join(', ') || 'Loading...'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTable}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input text-xs pl-9 pr-3 py-1.5 w-48 sm:w-64"
              />
            </div>
          </div>
        </div>

        {loadingTable ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-600" />
            Querying SQLite table <code className="font-mono">{activeTable}</code>...
          </div>
        ) : !tableData || filteredRows.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-xl">
            {searchTerm ? `No records matching "${searchTerm}"` : `Table "${activeTable}" currently has 0 rows.`}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="p-3 font-mono font-bold text-[11px] text-slate-400 w-12">#</th>
                  {tableData.columns.map((col) => (
                    <th key={col} className="p-3 font-mono font-bold text-[11px] uppercase tracking-wider text-slate-700 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-cyan-50/40 transition-colors">
                    <td className="p-3 font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                    {tableData.columns.map((col) => {
                      const val = row[col];
                      const isId = col.includes('id') || col === 'email';
                      const isStatus = col === 'status';

                      return (
                        <td key={col} className="p-3 whitespace-nowrap text-slate-800">
                          {val === null || val === undefined ? (
                            <span className="text-slate-300 italic font-mono text-[10px]">NULL</span>
                          ) : isStatus ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              val === 'confirmed' || val === 'approved' || val === 'success' || val === 'in-stock'
                                ? 'bg-emerald-100 text-emerald-800'
                                : val === 'pending' || val === 'draft' || val === 'low-stock' || val === 'warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {String(val)}
                            </span>
                          ) : isId ? (
                            <span className="font-mono text-slate-900 font-semibold text-xs">
                              {String(val)}
                            </span>
                          ) : (
                            <span className="text-slate-700 max-w-xs truncate block" title={String(val)}>
                              {String(val)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Terminal Query Help Banner */}
      <div className="card p-5 bg-slate-900 text-slate-200 border-slate-800 mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
            <Activity className="w-4 h-4" />
            <span>DIRECT TERMINAL ACCESS</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Database file: server/pharmacon.db</span>
        </div>
        <p className="text-xs text-slate-300">
          You can also run direct SQL queries in your terminal anytime without launching the browser:
        </p>
        <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-cyan-300 overflow-x-auto space-y-1">
          <div><span className="text-slate-500"># Inspect all users with email PK:</span></div>
          <div>node -e "const &#123; db &#125; = require('./server/db'); console.table(db.prepare('SELECT email, name, role FROM users').all());"</div>
          <div className="pt-1"><span className="text-slate-500"># Inspect active prescriptions:</span></div>
          <div>node -e "const &#123; db &#125; = require('./server/db'); console.table(db.prepare('SELECT id, patient_name, doctor_name, status FROM prescriptions').all());"</div>
        </div>
      </div>
    </div>
  );
}
