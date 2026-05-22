import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { supabase } from '../supabaseClient';

const CATEGORY_CONFIG = {
  recyclable: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  label: 'Recyclable',    desc: 'Place in your recycling bin. Rinse if needed.' },
  trash:      { color: '#64748b', bg: 'rgba(100,116,139,0.08)',border: 'rgba(100,116,139,0.25)',label: 'General Waste', desc: 'Place in the regular waste bin.'               },
  hazardous:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', label: 'Hazardous',     desc: 'Take to a hazardous waste facility. Never bin it.' },
  compost:    { color: '#84cc16', bg: 'rgba(132,204,22,0.08)', border: 'rgba(132,204,22,0.25)', label: 'Compostable',   desc: 'Place in your compost or food waste bin.'      },
}

function Scanner({ userId, onStatsUpdate }) {
  const [mode,         setMode]         = useState('search'); // search | scanning | result
  const [cameraStatus, setCameraStatus] = useState('idle'); // idle | starting | active | denied | error
  const [query,        setQuery]        = useState('');
  const [result,       setResult]       = useState(null);
  const [showTagForm,  setShowTagForm]  = useState(false);
  const [tagData,      setTagData]      = useState({ category: 'recyclable', productName: '', notes: '' });
  const [message,      setMessage]      = useState({ type: '', text: '' });
  const [searching,    setSearching]    = useState(false);
  const scannerRef = useRef(null);

  // Start camera scanner
  const startScanner = async () => {
    // Check permission first on supported browsers
    if (navigator.permissions) {
      try {
        const perm = await navigator.permissions.query({ name: 'camera' });
        if (perm.state === 'denied') {
          setCameraStatus('denied');
          return;
        }
      } catch(e) {}
    }

    setMode('scanning');
    setCameraStatus('starting');
  };

  useEffect(() => {
    if (mode !== 'scanning') return;

    const timer = setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'reader',
          {
            qrbox: { width: 260, height: 260 },
            fps: 8,
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.QR_CODE,
            ],
          },
          false
        );

        scanner.render(
          (decodedText) => {
            scanner.clear().catch(() => {});
            scannerRef.current = null;
            setMode('search');
            setCameraStatus('idle');
            lookupBarcode(decodedText);
          },
          () => {} // Ignore per-frame errors
        );

        scannerRef.current = scanner;
        setCameraStatus('active');
      } catch(err) {
        if (err.message?.toLowerCase().includes('permission') || err.message?.toLowerCase().includes('denied')) {
          setCameraStatus('denied');
        } else {
          setCameraStatus('error');
        }
        setMode('search');
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [mode]);

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setMode('search');
    setCameraStatus('idle');
  };

  const lookupBarcode = async (barcode) => {
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error?.code === 'PGRST116' || !data) {
        setResult({ barcode, found: false });
        setShowTagForm(true);
        setMode('result');
      } else if (data) {
        setResult({ ...data, found: true });
        setShowTagForm(false);
        setMode('result');
        onStatsUpdate?.(1, 1, 0);
        showMsg('success', '+1 point earned!');
      }
    } catch {
      showMsg('error', 'Error looking up item. Try again.');
    }
    setSearching(false);
  };

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    lookupBarcode(q);
  };

  const handleTagSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('products').insert([{
        barcode:      result.barcode,
        product_name: tagData.productName,
        category:     tagData.category,
        notes:        tagData.notes,
        tagged_by:    userId,
      }]);
      if (!error) {
        onStatsUpdate?.(10, 0, 1);
        showMsg('success', '+10 points! Thanks for helping the community!');
        setShowTagForm(false);
        setResult(null);
        setMode('search');
        setQuery('');
        setTagData({ category: 'recyclable', productName: '', notes: '' });
      }
    } catch {
      showMsg('error', 'Error submitting tag. Try again.');
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const reset = () => {
    setResult(null);
    setShowTagForm(false);
    setMode('search');
    setQuery('');
    setCameraStatus('idle');
  };

  const cat = result?.found ? (CATEGORY_CONFIG[result.category] || CATEGORY_CONFIG.trash) : null;

  return (
    <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Toast message */}
      {message.text && (
        <div style={{
          padding: '12px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: message.type === 'success' ? 'var(--green)' : 'var(--red)',
        }}>
          {message.text}
        </div>
      )}

      {/* Camera denied warning */}
      {cameraStatus === 'denied' && (
        <div style={{
          padding: '14px', borderRadius: 12, fontSize: 13, lineHeight: 1.6,
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
          color: '#f59e0b',
        }}>
          <strong>Camera access was denied.</strong><br />
          To fix: tap the lock icon in your browser bar → Site settings → Camera → Allow. Then try again.
        </div>
      )}

      {/* Search bar */}
      {mode !== 'scanning' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search item name or enter barcode..."
            style={{
              flex: 1, background: 'var(--surface)', border: '1px solid var(--border2)',
              borderRadius: 12, padding: '13px 16px',
              color: 'var(--text)', fontSize: 14, outline: 'none',
              fontFamily: 'var(--font)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'}
          />
          <button onClick={handleSearch} disabled={searching || !query.trim()} style={{
            background: 'var(--green)', border: 'none', borderRadius: 12,
            padding: '0 16px', color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', flexShrink: 0, fontFamily: 'var(--font)',
          }}>
            {searching ? '...' : 'Search'}
          </button>
        </div>
      )}

      {/* Camera button */}
      {mode === 'search' && (
        <button onClick={startScanner} style={{
          width: '100%', padding: '14px', borderRadius: 12,
          background: 'var(--surface)', border: '2px dashed var(--border2)',
          color: 'var(--muted)', fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontFamily: 'var(--font)', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--muted)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          Scan Barcode with Camera
          <span style={{ fontSize: 11, color: 'var(--dim)' }}>Point at any product barcode</span>
        </button>
      )}

      {/* Scanner view */}
      {mode === 'scanning' && (
        <div>
          <div style={{
            fontSize: 13, color: 'var(--muted)', textAlign: 'center',
            marginBottom: 10, padding: '8px 12px',
            background: 'var(--surface)', borderRadius: 8,
          }}>
            {cameraStatus === 'starting' ? 'Starting camera...' : 'Point your camera at a barcode'}
          </div>
          <div id="reader" style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }} />
          <button onClick={stopScanner} style={{
            width: '100%', marginTop: 10, padding: '12px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, color: '#ef4444', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font)',
          }}>
            Cancel
          </button>
        </div>
      )}

      {/* Result */}
      {mode === 'result' && result?.found && cat && (
        <div style={{
          background: cat.bg, border: `1px solid ${cat.border}`,
          borderRadius: 14, overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${cat.border}` }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.border}` }}>
              {cat.label}
            </span>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 10, letterSpacing: '-0.3px' }}>{result.product_name}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>{cat.desc}</div>
            {result.notes && (
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, padding: '8px 10px', background: 'var(--surface)', borderRadius: 8 }}>
                {result.notes}
              </div>
            )}
          </div>
          <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--mono)' }}>Barcode: {result.barcode}</span>
            <button onClick={reset} style={{ background: 'transparent', border: 'none', color: 'var(--green)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
              Scan Another
            </button>
          </div>
        </div>
      )}

      {/* Tag form */}
      {showTagForm && result && !result.found && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Tag This Item</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
            Barcode <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>{result.barcode}</span> not found. Tag it and earn 10 points!
          </div>
          <form onSubmit={handleTagSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              required
              placeholder="Product / Item name"
              value={tagData.productName}
              onChange={e => setTagData({ ...tagData, productName: e.target.value })}
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)' }}
            />
            <select
              value={tagData.category}
              onChange={e => setTagData({ ...tagData, category: e.target.value })}
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)', cursor: 'pointer' }}
            >
              <option value="recyclable">Recyclable</option>
              <option value="trash">General Waste</option>
              <option value="hazardous">Hazardous</option>
              <option value="compost">Compostable</option>
            </select>
            <textarea
              placeholder="Additional notes (optional)"
              value={tagData.notes}
              onChange={e => setTagData({ ...tagData, notes: e.target.value })}
              rows={3}
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={reset} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '11px', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }}>Cancel</button>
              <button type="submit" style={{ flex: 2, background: 'var(--green)', border: 'none', borderRadius: 8, padding: '11px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                Submit — Earn 10 Points
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Popular items */}
      {mode === 'search' && !result && (
        <div>
          <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Popular Items</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Plastic Bottle','Glass Bottle','Aluminum Can','Cardboard Box','Battery','Newspaper','Food Waste','Electronics'].map(q => (
              <button key={q} onClick={() => { setQuery(q); lookupBarcode(q); }} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 20, padding: '7px 14px', fontSize: 13,
                color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--green-bdr)'; e.currentTarget.style.color='var(--green)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)' }}
              >{q}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Scanner;
