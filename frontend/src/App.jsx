import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Analyzer from './pages/Analyzer'
import Results from './pages/Results'
import QuickScan from './pages/QuickScan'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/analyze" element={<Analyzer />} />
        <Route path="/results" element={<Results />} />
        <Route path="/quick-scan" element={<QuickScan />} />
      </Routes>
    </BrowserRouter>
  )
}
