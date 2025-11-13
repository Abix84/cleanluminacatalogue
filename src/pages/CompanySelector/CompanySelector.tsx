import { useCompany } from '@/context/CompanyContext';
import cleanExpressLogo from '/cleanexpresslogo.png';
import luminaDistributionLogo from '/luminadistribution.png';

const CompanySelector = () => {
  const { selectCompany } = useCompany();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Sélectionnez une entreprise</h1>
        <div className="flex flex-col sm:flex-row space-y-8 sm:space-y-0 sm:space-x-8">
          <div
            className="cursor-pointer p-6 border rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white"
            onClick={() => selectCompany('CleanExpress')}
          >
            <img src={cleanExpressLogo} alt="CleanExpress Logo" className="h-32 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">CleanExpress</h2>
          </div>
          <div
            className="cursor-pointer p-6 border rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white"
            onClick={() => selectCompany('Lumina Distribution')}
          >
            <img src={luminaDistributionLogo} alt="Lumina Distribution Logo" className="h-32 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">Lumina Distribution</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySelector;
