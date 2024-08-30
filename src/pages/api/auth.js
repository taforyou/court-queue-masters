import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === '1234') {
      const token = 'authenticated'; // In a real app, use a proper JWT
      res.setHeader('Set-Cookie', serialize('auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 30 * 60, // 30 minutes
        sameSite: 'strict',
        path: '/',
      }));
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}