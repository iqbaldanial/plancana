const { PrismaClient } = require('@prisma/client')
const express = require('express')

const prisma = new PrismaClient()
const app = express()

// Middleware
app.use(express.json())



//create crops info


// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...')
    await prisma.$disconnect()
    process.exit(0)
})

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...')
    await prisma.$disconnect()
    process.exit(0)
})

// Start server
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})