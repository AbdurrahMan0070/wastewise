import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../supabaseClient';

function Scanner({ userId, onStatsUpdate }) {
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [result, setResult] = useState(null);
  const [showTagForm, setShowTagForm] = useState(false);
  const [tagData, setTagData] = useState({
    category: 'recyclable',
    productName: '',
    notes: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 5,
      });

      scanner.render(onScanSuccess, onScanError);

      function onScanSuccess(decodedText) {
        scanner.clear();
        setScanning(false);
        lookupBarcode(decodedText);
      }

      function onScanError(err) {
        // Ignore scan errors (they happen constantly while scanning)
      }

      return () => {
        scanner.clear().catch(err => console.log(err));
      };
    }
  }, [scanning]);

  const lookupBarcode = async (barcode) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error && error.code === 'PGRST116') {
        // Product not found
        setResult({ barcode, found: false });
        setShowTagForm(true);
      } else if (data) {
        setResult({ ...data, found: true });
        setShowTagForm(false);
        // Award points for scanning
        onStatsUpdate(1, 1, 0);
        setMessage({ type: 'success', text: '+1 point for scanning!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Error looking up barcode:', err);
      setMessage({ type: 'error', text: 'Error looking up product' });
    }
  };

  const handleManualLookup = () => {
    if (manualBarcode.trim()) {
      lookupBarcode(manualBarcode.trim());
    }
  };

  const handleTagSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          barcode: result.barcode,
          product_name: tagData.productName,
          category: tagData.category,
          notes: tagData.notes,
          tagged_by: userId
        }]);

      if (!error) {
        // Award points for tagging
        onStatsUpdate(10, 0, 1);
        setMessage({ type: 'success', text: '+10 points for tagging! You helped the community!' });
        setShowTagForm(false);
        setResult(null);
        setTagData({ category: 'recyclable', productName: '', notes: '' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Error tagging product:', err);
      setMessage({ type: 'error', text: 'Error tagging product' });
    }
  };

  const getCategoryInfo = (category) => {
    const info = {
      recyclable: {
        icon: '♻️',
        title: 'Recyclable',
        description: 'This item can be recycled! Place it in your recycling bin.',
        color: 'recyclable'
      },
      trash: {
        icon: '🗑️',
        title: 'General Trash',
        description: 'This item goes in the regular trash bin.',
        color: 'trash'
      },
      hazardous: {
        icon: '⚠️',
        title: 'Hazardous Waste',
        description: 'This item requires special disposal. Take it to a hazardous waste facility.',
        color: 'hazardous'
      },
      compost: {
        icon: '🌱',
        title: 'Compostable',
        description: 'This item can be composted! Add it to your compost bin.',
        color: 'compost'
      }
    };
    return info[category] || info.trash;
  };

  return (
    <div className="scanner-container">
      <h2>Scan or Enter Barcode</h2>

      {message.text && (
        <div className={message.type}>{message.text}</div>
      )}

      {!scanning && !result && (
        <button 
          className="location-button"
          onClick={() => setScanning(true)}
        >
          📷 Start Camera Scanner
        </button>
      )}

      {scanning && <div id="reader"></div>}

      {scanning && (
        <button 
          className="location-button"
          style={{ background: '#dc3545' }}
          onClick={() => setScanning(false)}
        >
          Stop Scanner
        </button>
      )}

      <div className="manual-input">
        <input
          type="text"
          placeholder="Or enter barcode manually"
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleManualLookup()}
        />
        <button onClick={handleManualLookup}>
          🔍 Look Up
        </button>
      </div>

      {result && result.found && (
        <div className={`result-card ${getCategoryInfo(result.category).color}`}>
          <h3>{getCategoryInfo(result.category).icon} {getCategoryInfo(result.category).title}</h3>
          <h4>{result.product_name}</h4>
          <p>{getCategoryInfo(result.category).description}</p>
          {result.notes && <p><strong>Notes:</strong> {result.notes}</p>}
          <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
            Barcode: {result.barcode}
          </p>
        </div>
      )}

      {showTagForm && result && !result.found && (
        <div className="tag-form">
          <h3>🎯 Product Not Found - Help the Community!</h3>
          <p>Tag this product and earn 10 points!</p>
          <form onSubmit={handleTagSubmit}>
            <input
              type="text"
              placeholder="Product Name"
              value={tagData.productName}
              onChange={(e) => setTagData({ ...tagData, productName: e.target.value })}
              required
            />
            <select
              value={tagData.category}
              onChange={(e) => setTagData({ ...tagData, category: e.target.value })}
              required
            >
              <option value="recyclable">♻️ Recyclable</option>
              <option value="trash">🗑️ General Trash</option>
              <option value="hazardous">⚠️ Hazardous Waste</option>
              <option value="compost">🌱 Compostable</option>
            </select>
            <textarea
              placeholder="Additional notes (optional)"
              value={tagData.notes}
              onChange={(e) => setTagData({ ...tagData, notes: e.target.value })}
              rows="3"
            />
            <button type="submit">
              Tag Product & Earn 10 Points
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Scanner;
