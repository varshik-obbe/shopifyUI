import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Frame } from '@shopify/polaris';
import Home from './Home'
import ProductList from './ProductList'

const RoutePage = () => {

    return (
        <Frame>
            <Router>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/:id' element={<ProductList />} />
                </Routes>
            </Router>
        </Frame>
    )
}

export default RoutePage