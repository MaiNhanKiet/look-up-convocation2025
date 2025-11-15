import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import googleClient from '../config/google.config'

const router = Router()

// POST /auth/google
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({ message: 'Missing credential' })
    }

    // Verify id_token với Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()

    if (!payload || !payload.sub || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google user' })
    }

    const googleId = payload.sub
    const email = payload.email
    const name = payload.name
    const picture = payload.picture

    // TODO: sau này bạn gắn vào DB, giờ mock user cho dễ test
    const user = {
      id: googleId,
      email,
      name,
      picture
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in env')
      return res.status(500).json({ message: 'Server misconfigured' })
    }

    const appToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.json({
      token: appToken,
      user
    })
  } catch (error) {
    console.error('Google login error:', error)
    return res.status(500).json({ message: 'Google login failed' })
  }
})

export default router
