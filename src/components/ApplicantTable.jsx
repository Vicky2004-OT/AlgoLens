import React from 'react';

const ApplicantTable = ({ applicants, showBiased = true, maxRows = 20 }) => {
  const displayApplicants = applicants.slice(0, maxRows);

  const getDecisionColor = (decision) => {
    return decision === 'Approved' ? 'text-green-400' : 'text-red-400';
  };

  const getDecisionBg = (decision) => {
    return decision === 'Approved' ? 'bg-green-400/20' : 'bg-red-400/20';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 font-medium text-gray-300">ID</th>
            <th className="text-left py-3 px-4 font-medium text-gray-300">Name</th>
            <th className="text-left py-3 px-4 font-medium text-gray-300">Age</th>
            <th className="text-left py-3 px-4 font-medium text-gray-300">Gender</th>
            <th className="text-left py-3 px-4 font-medium text-gray-300">Zip Tier</th>
            <th className="text-left py-3 px-4 font-medium text-gray-300">Income</th>
            <th className="text-left py-3 px-4 font-medium text-gray-300">Credit</th>
            <th className="text-left py-3 px-4 font-medium text-gray-300">Score</th>
            <th className="text-left py-3 px-4 font-medium text-gray-300">Decision</th>
          </tr>
        </thead>
        <tbody>
          {displayApplicants.map((applicant, index) => (
            <tr 
              key={applicant.id} 
              className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                index % 2 === 0 ? '' : 'bg-white/2'
              }`}
            >
              <td className="py-3 px-4 text-gray-400">{applicant.id}</td>
              <td className="py-3 px-4 text-white">{applicant.name}</td>
              <td className="py-3 px-4 text-gray-300">{applicant.age}</td>
              <td className="py-3 px-4 text-gray-300">{applicant.gender}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs ${
                  applicant.zipTier === 'High' ? 'bg-green-500/20 text-green-400' :
                  applicant.zipTier === 'Mid' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {applicant.zipTier}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-300">${applicant.income.toLocaleString()}</td>
              <td className="py-3 px-4 text-gray-300">{applicant.creditScore}</td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">
                    {(showBiased ? applicant.biasedScore : applicant.unbiasedScore).toFixed(3)}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDecisionBg(showBiased ? applicant.biasedDecision : applicant.unbiasedDecision)} ${getDecisionColor(showBiased ? applicant.biasedDecision : applicant.unbiasedDecision)}`}>
                  {showBiased ? applicant.biasedDecision : applicant.unbiasedDecision}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {applicants.length > maxRows && (
        <div className="text-center py-4 text-gray-400 text-sm">
          Showing {maxRows} of {applicants.length} applicants
        </div>
      )}
    </div>
  );
};

export default ApplicantTable;
