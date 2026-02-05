import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/auth.service";

type AdminDashboardProps = {
  onSignOut: () => void;
};

export default function AdminDashboard({ onSignOut }: AdminDashboardProps) {
  const { userEmail } = useAuth();

  const handleSignOut = () => {
    authService.signOut();
    onSignOut();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      color: 'white'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px' }}>Admin Dashboard</h1>
          <p style={{ margin: '5px 0', opacity: 0.9 }}>{userEmail}</p>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Sign Out
        </button>
      </header>

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '30px',
          borderRadius: '16px',
          color: '#333',
          marginBottom: '20px'
        }}>
          <h2 style={{ marginTop: 0 }}>Admin Panel</h2>
          <p>Welcome to the Mallu Cupid admin dashboard. This is where you can manage users, verifications, and platform settings.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '24px',
            borderRadius: '12px',
            color: '#333'
          }}>
            <h3 style={{ marginTop: 0 }}>User Management</h3>
            <p>View and manage all registered users</p>
            <button style={{
              padding: '10px 20px',
              background: '#667eea',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '10px'
            }}>
              View Users
            </button>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '24px',
            borderRadius: '12px',
            color: '#333'
          }}>
            <h3 style={{ marginTop: 0 }}>Verification Requests</h3>
            <p>Review and approve user verifications</p>
            <button style={{
              padding: '10px 20px',
              background: '#667eea',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '10px'
            }}>
              Review Verifications
            </button>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '24px',
            borderRadius: '12px',
            color: '#333'
          }}>
            <h3 style={{ marginTop: 0 }}>Reports</h3>
            <p>View and manage user reports</p>
            <button style={{
              padding: '10px 20px',
              background: '#667eea',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '10px'
            }}>
              View Reports
            </button>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '24px',
            borderRadius: '12px',
            color: '#333'
          }}>
            <h3 style={{ marginTop: 0 }}>Platform Settings</h3>
            <p>Configure platform settings</p>
            <button style={{
              padding: '10px 20px',
              background: '#667eea',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '10px'
            }}>
              Manage Settings
            </button>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '40px'
        }}>
          <h3 style={{ marginTop: 0 }}>Quick Stats</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginTop: '15px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>0</div>
              <div style={{ opacity: 0.9 }}>Total Users</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>0</div>
              <div style={{ opacity: 0.9 }}>Pending Verifications</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>0</div>
              <div style={{ opacity: 0.9 }}>Active Reports</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
