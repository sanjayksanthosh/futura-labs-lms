import { motion } from 'framer-motion';
import { useFetch } from '../../hooks/useQuery';
import { internshipService } from '../../services/endpoints';
import { Briefcase } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/helpers';

const statusColors = { active: 'success', completed: 'info', pending: 'warning', cancelled: 'danger' };

export const StudentInternships = () => {
  const { data, isLoading } = useFetch('my-internships', () => internshipService.getAll({ limit: 50 }));
  const internships = data?.data || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Internships</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {internships.length === 0 ? <div className="col-span-full text-center py-16 text-slate-500">No internships yet</div> : internships.map((intern) => (
          <div key={intern._id} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30"><Briefcase className="h-5 w-5 text-primary-600" /></div>
              <div><h3 className="font-semibold">{intern.company}</h3><p className="text-sm text-slate-500">{intern.position}</p></div>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-500">{formatDate(intern.startDate)} - {intern.endDate ? formatDate(intern.endDate) : 'Present'}</span>
              <Badge variant={statusColors[intern.status]} className="capitalize">{intern.status}</Badge>
            </div>
            {intern.skills?.length > 0 && <p className="text-xs text-slate-400">Skills: {intern.skills.join(', ')}</p>}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
