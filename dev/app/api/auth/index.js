const { PrismaClient } = require('@prisma/client')
const express = require('express')

const prisma = new PrismaClient()
const app = express()

// Middleware
app.use(express.json())


// Get all users
app.get('/users', async (req, res) => {
    
    try {
        const users = await prisma.user.findMany()
        res.status(200).json(users)
    } catch (error) {
        console.error('Error fetching users:', error)
        res.status(500).json({ message: error.message })
    }
})

// Create a new user
app.post('/users', async (req, res) => {
    try {
        const { name, email ,role} = req.body
        if (!name || !email || !role) {
            return res.status(400).json({ message: "Name, email, and role are required" });
        }
        const user = await prisma.user.create({
            data: { name, email ,role}
        })
        res.status(201).json(user)
    } catch (error) {
        console.error('Error creating user:', error)
        res.status(500).json({ message: error.message })
    }
})

// Get user by ID
app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        })
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        
        res.status(200).json(user)
    } catch (error) {
        console.error('Error fetching user:', error)
        res.status(500).json({ message: error.message })
    }
})

//list all crop info

app.get('/crops', async (req, res) => {
    
    try {
        const crops = await prisma.crop.findMany()
        res.status(200).json(crops)
    } catch (error) {
        console.error('Error fetching users:', error)
        res.status(500).json({ message: error.message })
    }
})

//create crops info
app.post('/crops', async(req,res) =>{
    try {
        const {name, description, longitude, latitude} = req.body
        const crop = await prisma.crop.create({
            data: {
                name, 
                description, 
                longitude : parseFloat(longitude) , 
                latitude: parseFloat(latitude)
            }
        })
        res.status(200).json(crop)
    } catch (error) {
        res.status(500).json({message : error.message})
    }
})
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