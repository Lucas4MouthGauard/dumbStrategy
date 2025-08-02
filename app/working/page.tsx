import React from 'react'

export default function WorkingPage() {
  return (
    <html lang="zh-CN">
      <head>
        <title>NoStrategy - 工作测试页面</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #4c1d95 50%, #000000 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            text-align: center;
            color: white;
          }
          h1 {
            font-size: 4rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }
          p {
            font-size: 1.5rem;
            color: #d1d5db;
            margin-bottom: 2rem;
          }
          .slogan {
            font-size: 1.25rem;
            color: #fbbf24;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .button {
            display: inline-block;
            background: linear-gradient(45deg, #8844FF, #FF4444);
            color: white;
            padding: 1rem 2rem;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(136, 68, 255, 0.3);
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(136, 68, 255, 0.4);
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <h1>🚀 NoStrategy</h1>
          <p>嘲讽微策略的Meme网站</p>
          <div className="slogan">"策略是骗人的，感觉才是真实的！"</div>
          <a href="/" className="button">返回主页</a>
        </div>
      </body>
    </html>
  )
} 