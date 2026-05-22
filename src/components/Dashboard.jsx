import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Dashboard() {
  const [stats, setStats] = useState({
    totalScans: 0,
    totalTags: 0,
    totalUsers: 0,
    categoryBreakdown: {
      recyclable: 0,
      trash: 0,
      hazardous: 0,
      compost: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGlobalStats();
  }, []);

  const loadGlobalStats = async () => {
    try {
      // Get total users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('scans, tags');

      if (!usersError && users) {
        const totalScans = users.reduce((sum, u) => sum + u.scans, 0);
        const totalTags = users.reduce((sum, u) => sum + u.tags, 0);
        
        // Get category breakdown
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('category');

        const breakdown = {
          recyclable: 0,
          trash: 0,
          hazardous: 0,
          compost: 0
        };

        if (!productsError && products) {
          products.forEach(p => {
            if (breakdown.hasOwnProperty(p.category)) {
              breakdown[p.category]++;
            }
          });
        }

        setStats({
          totalScans,
          totalTags,
          totalUsers: users.length,
          categoryBreakdown: breakdown
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading stats:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading impact data...</div>;
  }

  const totalItems = Object.values(stats.categoryBreakdown).reduce((a, b) => a + b, 0);
  const estimatedCO2Saved = (stats.totalScans * 0.5).toFixed(1); // Rough estimate
  const estimatedWasteDiverted = (stats.totalScans * 0.2).toFixed(1); // kg

  return (
    <div>
      <h2>📊 Community Impact Dashboard</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        See the collective environmental impact we're making together
      </p>

      <div className="impact-stats">
        <div className="impact-card">
          <h3>{stats.totalUsers}</h3>
          <p>Active Users</p>
        </div>
        <div className="impact-card">
          <h3>{stats.totalScans}</h3>
          <p>Items Scanned</p>
        </div>
        <div className="impact-card">
          <h3>{stats.totalTags}</h3>
          <p>Items Tagged</p>
        </div>
        <div className="impact-card">
          <h3>{estimatedCO2Saved} kg</h3>
          <p>CO₂ Saved</p>
        </div>
        <div className="impact-card">
          <h3>{estimatedWasteDiverted} kg</h3>
          <p>Waste Diverted</p>
        </div>
        <div className="impact-card">
          <h3>{totalItems}</h3>
          <p>Products in Database</p>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
        <h3>Category Breakdown</h3>
        <div style={{ marginTop: '15px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>♻️ Recyclable:</strong> {stats.categoryBreakdown.recyclable} items
            <div style={{ 
              height: '10px', 
              background: '#28a745', 
              width: `${totalItems ? (stats.categoryBreakdown.recyclable / totalItems * 100) : 0}%`,
              borderRadius: '5px',
              marginTop: '5px'
            }}></div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>🗑️ General Trash:</strong> {stats.categoryBreakdown.trash} items
            <div style={{ 
              height: '10px', 
              background: '#6c757d', 
              width: `${totalItems ? (stats.categoryBreakdown.trash / totalItems * 100) : 0}%`,
              borderRadius: '5px',
              marginTop: '5px'
            }}></div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>⚠️ Hazardous:</strong> {stats.categoryBreakdown.hazardous} items
            <div style={{ 
              height: '10px', 
              background: '#dc3545', 
              width: `${totalItems ? (stats.categoryBreakdown.hazardous / totalItems * 100) : 0}%`,
              borderRadius: '5px',
              marginTop: '5px'
            }}></div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>🌱 Compostable:</strong> {stats.categoryBreakdown.compost} items
            <div style={{ 
              height: '10px', 
              background: '#8b4513', 
              width: `${totalItems ? (stats.categoryBreakdown.compost / totalItems * 100) : 0}%`,
              borderRadius: '5px',
              marginTop: '5px'
            }}></div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', background: '#d4edda', borderRadius: '10px', color: '#155724' }}>
        <h3>🌍 Making a Difference</h3>
        <p>Every scan helps someone dispose of waste correctly. Every tag makes the system smarter for everyone. Together, we're building a cleaner planet!</p>
      </div>
    </div>
  );
}

export default Dashboard;
