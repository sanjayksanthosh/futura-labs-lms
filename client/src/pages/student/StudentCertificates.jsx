import { motion } from 'framer-motion';
import { useFetch } from '../../hooks/useQuery';
import { certificateService } from '../../services/endpoints';
import { Award, Download } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/helpers';

const statusColors = { approved: 'success', pending: 'warning', rejected: 'danger' };

export const StudentCertificates = () => {
  const { data, isLoading } = useFetch('my-certificates', () => certificateService.getAll({ limit: 50 }));
  const certificates = data?.data || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Certificates</h1><p className="text-slate-500">Download your certificates</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500">No certificates yet. Complete courses to earn certificates.</div>
        ) : certificates.map((cert) => (
          <motion.div key={cert._id} whileHover={{ scale: 1.02 }} className="glass rounded-2xl p-6 text-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 w-fit mx-auto mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold mb-1">{cert.title}</h3>
            <p className="text-sm text-slate-500 mb-2">Issued: {formatDate(cert.issuedDate)}</p>
            <Badge variant={statusColors[cert.status]} className="capitalize">{cert.status}</Badge>
            {cert.status === 'approved' && (
              <button className="btn-primary mt-4 w-full flex items-center justify-center gap-2">
                <Download className="h-4 w-4" /> Download
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
