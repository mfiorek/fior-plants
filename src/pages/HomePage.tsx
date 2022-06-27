import { withAuthCheck } from '../components/withAuthCheck';
import { Route, Routes } from 'react-router-dom';
import PlantsPage from './PlantsPage';
import PlantDetailsPage from './PlantDetailsPage';
import Page404 from './Page404';
import NavBar from '../components/NavBar';

function HomePage() {
  return (
    <div className='flex min-h-screen flex-col bg-teal-800'>
      <NavBar />
      <Routes>
        <Route index element={<PlantsPage />} />
        <Route path='plant/:plantId' element={<PlantDetailsPage />} />
        <Route path='*' element={<Page404 />} />
      </Routes>
    </div>
  );
}

export default withAuthCheck(HomePage, true);
