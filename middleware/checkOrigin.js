// middleware/checkOrigin.js
export const checkOrigin = (req, res, next) => {
    const allowedOrigins = [
        "http://localhost:5173",
        "https://comptron.nwu.ac.bd",
        "https://comptron-club-62ud.vercel.app",
        "https://comptron.vercel.app",
        ];
  
    const origin = req.get('Origin') || req.get('Referer');
  
    if (!origin || !allowedOrigins.some(o => origin.startsWith(o))) {
      return res.status(403).json({ error: 'Access denied' });
    }
  
    next();
  };
  