'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleExtract = async () => {
    if (!url) return alert('URL을 입력하세요');
    setLoading(true);
    setData(null);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.details || result.error);
      setData(result);
    } catch (err: any) {
      alert('에러 발생: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>🎨 Real-time Design System Extractor</h1>
        <div style={{ marginTop: '20px' }}>
          <input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com" 
            style={{ padding: '12px', width: '60%', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <button 
            onClick={handleExtract} 
            disabled={loading}
            style={{ padding: '12px 24px', marginLeft: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            {loading ? '분석 중...' : '지금 분석하기'}
          </button>
        </div>
      </header>

      {data && (
        <div>
          <section style={{ marginBottom: '40px' }}>
            <h2>📸 Screenshot</h2>
            <img src={data.screenshot} alt="Screenshot" style={{ width: '100%', borderRadius: '12px', border: '1px solid #ddd' }} />
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2>🌈 Colors</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
              {data.colors.map((c: string) => (
                <div key={c} style={{ backgroundColor: c, height: '80px', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', padding: '5px', color: 'white', fontSize: '10px', textShadow: '0 1px 2px black' }}>
                  {c}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>⚙️ Variables</h2>
            <pre style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', overflowX: 'auto' }}>
              {JSON.stringify(data.variables, null, 2)}
            </pre>
          </section>
        </div>
      )}
    </main>
  );
}
