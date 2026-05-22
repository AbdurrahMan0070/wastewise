import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Leaderboard({ currentUserId }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false })
        .limit(50);

      if (!error && data) {
        setLeaders(data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  return (
    <div>
      <h2>🏆 Global Leaderboard</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Top contributors making a difference!
      </p>
      
      <ul className="leaderboard-list">
        {leaders.map((user, index) => (
          <li 
            key={user.user_id} 
            className={`leaderboard-item ${
              index === 0 ? 'top-1' : 
              index === 1 ? 'top-2' : 
              index === 2 ? 'top-3' : ''
            } ${user.user_id === currentUserId ? 'current-user' : ''}`}
            style={user.user_id === currentUserId ? { border: '3px solid #667eea' } : {}}
          >
            <div className="rank">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
            </div>
            <div className="user-info">
              <h4>{user.username} {user.user_id === currentUserId ? '(You)' : ''}</h4>
              <p>{user.scans} scans • {user.tags} tags</p>
            </div>
            <div className="points">{user.points}</div>
          </li>
        ))}
      </ul>

      {leaders.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
          No users yet. Be the first to scan and tag items!
        </p>
      )}
    </div>
  );
}

export default Leaderboard;
