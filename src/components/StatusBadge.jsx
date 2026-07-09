const STATUS_STYLES = {
  New: 'bg-signal-teal/10 text-signal-tealDark',
  Contacted: 'bg-blue-100 text-blue-800',
  Assigned: 'bg-blue-100 text-blue-800',
  'Sent to Business': 'bg-amber-100 text-amber-800',
  'Job Completed': 'bg-signal-green/10 text-signal-green',
  'Feedback Requested': 'bg-amber-100 text-amber-800',
  'Feedback Received': 'bg-signal-green/10 text-signal-green',
  Rejected: 'bg-signal-red/10 text-signal-red',
  Prospect: 'bg-slate-100 text-slate-700',
  Trial: 'bg-amber-100 text-amber-800',
  Active: 'bg-signal-green/10 text-signal-green',
  Paused: 'bg-slate-100 text-slate-700',
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700'
  return <span className={`status-tag ${style}`}>{status}</span>
}
