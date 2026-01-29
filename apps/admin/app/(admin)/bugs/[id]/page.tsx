'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Bug,
  User,
  Calendar,
  Image as ImageIcon,
  FileText,
  Monitor,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';
import { routes } from '@/lib/routes';
import Link from 'next/link';
import { useState } from 'react';

function getStatusIcon(status: string) {
  switch (status) {
    case 'open':
      return <Clock className="w-5 h-5 text-blue-400" />;
    case 'in_progress':
      return <Clock className="w-5 h-5 text-yellow-400" />;
    case 'resolved':
      return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    case 'closed':
      return <XCircle className="w-5 h-5 text-gray-400" />;
    default:
      return <Clock className="w-5 h-5 text-blue-400" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'open':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'in_progress':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'resolved':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'closed':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

export default function BugReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const [note, setNote] = useState('');

  // Fetch bug report
  const { data: report, isLoading, error, refetch } = adminTrpc.bugReports.get.useQuery(
    { reportId },
    { enabled: !!reportId }
  );

  // Fetch notes
  const { data: notes } = adminTrpc.bugReports.getNotes.useQuery(
    { reportId },
    { enabled: !!reportId }
  );

  // Mutations
  const updateStatus = adminTrpc.bugReports.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Status updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to update status', { description: error.message });
    },
  });

  const addNote = adminTrpc.bugReports.addNote.useMutation({
    onSuccess: () => {
      toast.success('Note added successfully');
      setNote('');
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to add note', { description: error.message });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-red-400 mb-4">Bug report not found</p>
        <Link
          href={routes.bugs}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Back to Bug Reports
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    const note = prompt('Optional note for status change:');
    await updateStatus.mutateAsync({
      reportId,
      status: newStatus as any,
      note: note || undefined,
    });
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    await addNote.mutateAsync({ reportId, note });
  };

  const consoleLogs = report.consoleLogs || [];
  const browserMetadata = report.browserMetadata;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-border hover:bg-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Bug className="w-6 h-6 text-primary" />
            Bug Report
          </h2>
          <p className="text-muted-foreground mt-1">
            {report.id.substring(0, 8)}...
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(report.status)}
          <select
            value={report.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updateStatus.isPending}
            className="min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Report Info */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold mb-4">Report Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="font-medium">
                {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center">
              {getStatusIcon(report.status)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={`font-medium ${getStatusBadge(report.status)} px-2 py-1 rounded-full inline-block text-xs`}>
                {report.status.replace('_', ' ')}
              </p>
            </div>
          </div>
          {report.user && (
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">User</p>
                <Link
                  href={routes.user.detail(report.user.id)}
                  className="font-medium text-primary hover:underline flex items-center gap-1"
                >
                  {report.user.email}
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
          {report.email && !report.user && (
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{report.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Description
        </h3>
        <p className="text-sm whitespace-pre-wrap">{report.description}</p>
      </div>

      {/* Screenshot */}
      {report.screenshotUrl ? (
        <div className="admin-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Screenshot
          </h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <img
              src={report.screenshotUrl}
              alt="Bug report screenshot"
              className="w-full h-auto max-h-[600px] object-contain"
            />
          </div>
          <a
            href={report.screenshotUrl}
            download
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Download Screenshot
          </a>
        </div>
      ) : (
        <div className="admin-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Screenshot
          </h3>
          <p className="text-muted-foreground">No screenshot provided</p>
        </div>
      )}

      {/* Console Logs */}
      {consoleLogs.length > 0 ? (
        <div className="admin-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Console Logs ({consoleLogs.length})
          </h3>
          <div className="bg-secondary/50 rounded-lg p-4 max-h-96 overflow-auto font-mono text-sm">
            {consoleLogs.map((log, i) => (
              <div key={i} className="mb-2">
                <span className="text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`ml-2 ${
                    log.level === 'error'
                      ? 'text-red-400'
                      : log.level === 'warn'
                      ? 'text-yellow-400'
                      : log.level === 'info'
                      ? 'text-blue-400'
                      : 'text-gray-400'
                  }`}
                >
                  [{log.level.toUpperCase()}]
                </span>
                <span className="ml-2">{log.message}</span>
                {log.stack && (
                  <details className="mt-1 ml-8">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                      {log.stack}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="admin-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Console Logs
          </h3>
          <p className="text-muted-foreground">No console logs captured</p>
        </div>
      )}

      {/* Browser Metadata */}
      {browserMetadata && (
        <div className="admin-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Browser Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">User Agent</p>
              <p className="text-sm font-mono break-all">{browserMetadata.userAgent}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">URL</p>
              <p className="text-sm break-all">{browserMetadata.url}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Viewport</p>
              <p className="text-sm">
                {browserMetadata.viewport.width} × {browserMetadata.viewport.height}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Platform</p>
              <p className="text-sm">{browserMetadata.platform}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Language</p>
              <p className="text-sm">{browserMetadata.language}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Timezone</p>
              <p className="text-sm">{browserMetadata.timezone}</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notes */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold mb-4">Admin Notes</h3>
        <div className="space-y-4">
          {/* Add Note Form */}
          <div className="flex gap-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 min-h-[100px] px-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleAddNote}
              disabled={!note.trim() || addNote.isPending}
              className="min-h-[100px] px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
            >
              {addNote.isPending ? 'Adding...' : 'Add Note'}
            </button>
          </div>

          {/* Notes List */}
          {notes && notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{note.adminName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No notes yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
