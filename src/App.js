import './App.css';

import { Sidebar } from './components/Sidebar';
import { AllRoutes } from './components/routes/AllRoutes';
function App() {
  return (
    <div className="App flex bg-lightGray">
      <Sidebar  />
        <AllRoutes />
    </div>
  );
}

export default App;
