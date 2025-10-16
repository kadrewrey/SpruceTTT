import React from 'react'
import { createRoot } from 'react-dom/client'
import './assets/index.css'
import { Main } from './main'


const root = createRoot(document.getElementById('root')!)
root.render(<Main />)
