import { Route, Routes, Navigate } from 'react-router-dom'
import NotFound from './NotFound'
import Home from './Home'
import Test from './Test'

function UserRoutes() {

    return (
        <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<Test/>} />
        </Routes>
    )
}

export default UserRoutes