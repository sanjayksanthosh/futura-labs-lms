import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, XCircle, Download, Eye, RotateCcw } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { certificateService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/helpers';

const statusConfig = {
  approved: { variant: 'success', icon: CheckCircle },
  pending: { variant: 'warning', icon: Eye },
  rejected: { variant: 'danger', icon: XCircle },
  revoked: { variant: 'danger', icon: RotateCcw },
};

export const AdminCertificates = () => {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useFetch(['admin-certificates', page], () => certificateService.getAll({ page, limit: 20 }));
  const approveMut = useMutate(({ id, url }) => certificateService.approve(id, url), { invalidateKeys: ['admin-certificates'] });
  const rejectMut = useMutate(({ id, reason }) => certificateService.reject(id, reason), { invalidateKeys: ['admin-certificates'] });
  const revokeMut = useMutate(({ id, reason }) => certificateService.revoke(id, reason), { invalidateKeys: ['admin-certificates'] });

  const certificates = data?.data || [];

  const columns = [
    { key: 'title', label: 'Certificate', render: (row) => <span className="text-sm font-medium">{row.title}</span> },
    { key: 'student', label: 'Student', render: (row) => {
      const name = row.student?.name || 'N/A';
      return (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xs"><Award className="h-3.5 w-3.5" /></div>
          <span className="text-sm">{name}</span>
        </div>
      );
    }},
    { key: 'course', label: 'Course', render: (row) => <span className="text-sm text-slate-500">{row.course?.title || '-'}</span> },
    { key: 'status', label: 'Status', render: (row) => {
      const cfg = statusConfig[row.status] || statusConfig.pending;
      return <Badge variant={cfg.variant} className="capitalize text-xs">{row.status}</Badge>;
    }},
    { key: 'issuedDate', label: 'Issued', render: (row) => <span className="text-xs text-slate-500">{formatDate(row.issuedDate)}</span> },
    { key: 'actions', label: '', render: (row) => (
      <div className="flex items-center gap-1">
        {row.status === 'pending' ? (
          <>
            <button onClick={(e) => { e.stopPropagation(); approveMut.mutate({ id: row._id, url: '' }); }} className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"><CheckCircle className="h-4 w-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); setSelected(row); }} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><XCircle className="h-4 w-4" /></button>
          </>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Eye className="h-3.5 w-3.5" /></button>
        )}
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="text-2xl font-bold">Certificates</h1><p className="text-slate-500">Manage certificate approvals</p></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total" value={data?.pagination?.total || certificates.length} icon={Award} color="primary" />
        <StatsCard title="Approved" value={certificates.filter(c => c.status === 'approved').length} icon={CheckCircle} color="secondary" />
        <StatsCard title="Pending" value={certificates.filter(c => c.status === 'pending').length} icon={Eye} color="accent" />
        <StatsCard title="Rejected" value={certificates.filter(c => c.status === 'rejected').length} icon={XCircle} color="danger" />
      </div>

      <DataTable columns={columns} data={certificates} loading={isLoading} page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />

      {/* Reject Modal */}
      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setRejectReason(''); }} title="Reject Certificate">
        <form onSubmit={(e) => { e.preventDefault(); rejectMut.mutate({ id: selected._id, reason: rejectReason }); setSelected(null); setRejectReason(''); }} className="space-y-4">
          <p className="text-sm text-slate-500">Provide a reason for rejecting: <strong>{selected?.title}</strong></p>
          <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Rejection reason..." className="input-field" rows={3} required />
          <button type="submit" className="btn-primary w-full bg-red-500 hover:bg-red-600">Reject Certificate</button>
        </form>
      </Modal>
    </motion.div>
  );
};
