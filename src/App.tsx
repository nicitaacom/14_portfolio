import { Route, Routes } from "react-router-dom"
import { Navbar } from "./components/Navbar/Navbar"
import { Main } from "./pages"

function App() {

  return (
    <>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Main/>}/>
      </Routes>
    </>
  )
}

export default App
