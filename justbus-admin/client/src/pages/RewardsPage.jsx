
import React, { useState, useEffect } from 'react';
import {
  getRewardRules,
  updateRewardRules,
  getRewards,
  createReward,
updateReward,
deleteReward
} from '../services/api';


export default function RewardsPage() {
  const [rules, setRules] = useState({
  points_per_trip: 0,
  bonus_threshold: 0,
  reward: '' });
  const [rewards, setRewards] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showRewardModal,
  setShowRewardModal] =
  useState(false);

const [editingReward,
  setEditingReward] =
  useState(null);

const [rewardForm,
  setRewardForm] =
  useState({
    title: '',
    description: '',
    points_required: '',
    type: ''
  });
  const [message, setMessage] = useState(null);

  useEffect(() => { loadData(); }, []);

async function loadData() {
  try {
    const [
      rulesRes,
      rewardsRes
    ] = await Promise.all([
      getRewardRules(),
      getRewards()
    ]);

    setRewards(rewardsRes.data);
    setRules(rulesRes.data);

  } catch (e) {
    console.error(e);
  }
}

  function openCreateReward() {

  setEditingReward(null);

  setRewardForm({
    title: '',
    description: '',
    points_required: '',
    type: ''
  });

  setShowRewardModal(true);
}

function openEditReward(reward) {

  setEditingReward(reward);

  setRewardForm({
    title: reward.title,
    description:
      reward.description,
    points_required:
      reward.points_required,
    type: reward.type
  });

  setShowRewardModal(true);
}

async function saveReward() {

  try {

    if (editingReward) {

      await updateReward(
        editingReward.id,
        rewardForm
      );

    } else {

      await createReward(
        rewardForm
      );
    }

    const rewardsRes =
      await getRewards();

    setRewards(
      rewardsRes.data
    );

    setShowRewardModal(false);
    setEditingReward(null);

  } catch (err) {

    console.error(err);
  }
}

async function handleDeleteReward(
  id
) {

  if (
    !window.confirm(
      'Delete this reward?'
    )
  ) return;

  try {

    await deleteReward(id);

    setRewards(prev =>
      prev.filter(r =>
        r.id !== id
      )
    );

  } catch (err) {

    console.error(err);
  }
}


function handleRuleChange(
  key,
  value
) {

  setRules(prev => ({
    ...prev,
    [key]: value
  }));
}

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await updateRewardRules(rules);
      setMessage({ type: 'success', text: '✅ Configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ type: 'error', text: '❌ Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  }

  const modalInputStyle = {
  width: '100%',
  minHeight: '48px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,.08)',
  background: '#111827',
  color: 'white',
  padding: '0 14px',
  outline: 'none',
  fontSize: '.95rem'
};

  return (
    <div className="content">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', marginBottom: '4px' }}>Rewards Configuration</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Configure points and redemption rules</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Left: Configuration */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.4)', 
          borderRadius: '16px', border: '1px solid var(--border)', 
          padding: '24px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.9rem' }}>⭐</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Reward Rules Configuration</h3>
          </div>

<div style={{
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginBottom: '24px'
}}>

  {/* Points Per Trip */}

  <div style={{
    background: 'var(--surface2)',
    padding: '18px',
    borderRadius: '14px',
    border: '1px solid var(--border)'
  }}>

    <div style={{
      marginBottom: '8px',
      fontWeight: 700
    }}>
      Points Per Trip
    </div>

    <input
      type="number"
      value={rules.points_per_trip}
      onChange={e =>
        handleRuleChange(
          'points_per_trip',
          e.target.value
        )
      }
      style={{
        width: '100%',
        height: '44px',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'white',
        padding: '0 14px'
      }}
    />

  </div>

  {/* Bonus Threshold */}

  <div style={{
    background: 'var(--surface2)',
    padding: '18px',
    borderRadius: '14px',
    border: '1px solid var(--border)'
  }}>

    <div style={{
      marginBottom: '8px',
      fontWeight: 700
    }}>
      Bonus Threshold
    </div>

    <input
      type="number"
      value={rules.bonus_threshold}
      onChange={e =>
        handleRuleChange(
          'bonus_threshold',
          e.target.value
        )
      }
      style={{
        width: '100%',
        height: '44px',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'white',
        padding: '0 14px'
      }}
    />

  </div>

  {/* Reward Type */}

  <div style={{
    background: 'var(--surface2)',
    padding: '18px',
    borderRadius: '14px',
    border: '1px solid var(--border)'
  }}>

    <div style={{
      marginBottom: '8px',
      fontWeight: 700
    }}>
      Bonus Reward
    </div>

    <select
  value={rules.reward}
  onChange={(e) =>
    handleRuleChange('reward', e.target.value)
  }
>
  <option value="">Select reward</option>

  {rewards.map((reward) => (
    <option
      key={reward.id}
      value={reward.id}
    >
      {reward.title}
    </option>
  ))}
</select>

  </div>

</div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', height: '48px', fontWeight: 700, letterSpacing: '0.5px' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '⏳ Saving...' : 'Save Configuration'}
          </button>
          
          {message && (
            <div style={{ 
              marginTop: '16px', textAlign: 'center', fontSize: '0.82rem', 
              color: message.type === 'success' ? 'var(--accent2)' : 'var(--accent3)' 
            }}>
              {message.text}
            </div>
          )}

                  <div style={{ marginTop: '28px' }}>



          <button
  className="btn btn-primary"
  onClick={openCreateReward}
  style={{
    marginBottom: '16px'
  }}
>
  + Add Reward
</button>

  <h3 style={{
    marginBottom: '18px',
    fontSize: '1rem'
  }}>
    Rewards Catalog
  </h3>

<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
  gap: '16px'
}}>

    {rewards.map(reward => (

      <div
        key={reward.id}
        style={{
          background: 'var(--surface2)',
          borderRadius: '14px',
          border:
            '1px solid var(--border)',
          padding: '16px'
        }}
      >

        <div style={{
          display: 'flex',
          justifyContent:
            'space-between',
          marginBottom: '6px'
        }}>

          <div style={{
            fontWeight: 700
          }}>
            {reward.title}
          </div>

          <div style={{
            color: 'var(--accent2)',
            fontWeight: 800
          }}>
            {reward.points_required}
            pts
          </div>

        </div>

        <div style={{
          color: 'var(--muted)',
          fontSize: '0.82rem'
        }}>
          {reward.description}
        </div>

        <div style={{
  display: 'flex',
  gap: '10px',
  marginTop: '14px'
}}>

  <button
    className="btn btn-secondary"
    onClick={() =>
      openEditReward(reward)
    }
  >
    ✏ Edit
  </button>

  <button
    className="btn btn-danger"
    onClick={() =>
      handleDeleteReward(
        reward.id
      )
    }
  >
    🗑 Delete
  </button>

</div>

      </div>

    ))}

  </div>

</div>
        </div>

      </div>

                {showRewardModal && (

  <div style={{
    position: 'fixed',
    inset: 0,
    background:
      'rgba(0,0,0,.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
  }}>

<div style={{
  width: '520px',
  background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: '24px',
  padding: '28px',
  boxShadow: '0 20px 60px rgba(0,0,0,.45)'
}}>

  {/* Header */}

  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  }}>

    <div>

      <h2 style={{
        margin: 0,
        fontSize: '1.7rem',
        fontWeight: 800,
        fontFamily: 'Syne, sans-serif'
      }}>
        {editingReward
          ? 'Edit Reward'
          : 'Create Reward'}
      </h2>

      <div style={{
        marginTop: '6px',
        color: 'var(--muted)',
        fontSize: '.9rem'
      }}>
        Configure reward settings
      </div>

    </div>

    <button
      onClick={() =>
        setShowRewardModal(false)
      }
      style={{
        width: '38px',
        height: '38px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,.08)',
        background: 'rgba(255,255,255,.03)',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1rem'
      }}
    >
      ✕
    </button>

  </div>

  {/* Form */}

  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  }}>

    {/* Title */}

    <div>

      <div style={{
        marginBottom: '8px',
        fontSize: '.82rem',
        color: 'var(--muted)'
      }}>
        Reward Title
      </div>

      <input
        placeholder="Ex: Free Trip"
        value={rewardForm.title}
        onChange={e =>
          setRewardForm(prev => ({
            ...prev,
            title: e.target.value
          }))
        }
        style={modalInputStyle}
      />

    </div>

    {/* Description */}

    <div>

      <div style={{
        marginBottom: '8px',
        fontSize: '.82rem',
        color: 'var(--muted)'
      }}>
        Description
      </div>

      <textarea
        placeholder="Describe this reward..."
        value={rewardForm.description}
        onChange={e =>
          setRewardForm(prev => ({
            ...prev,
            description:
              e.target.value
          }))
        }
        style={{
          ...modalInputStyle,
          minHeight: '90px',
          resize: 'none',
          paddingTop: '12px'
        }}
      />

    </div>

    {/* Points */}

    <div>

      <div style={{
        marginBottom: '8px',
        fontSize: '.82rem',
        color: 'var(--muted)'
      }}>
        Required Points
      </div>

      <input
        type="number"
        placeholder="250"
        value={rewardForm.points_required}
        onChange={e =>
          setRewardForm(prev => ({
            ...prev,
            points_required:
              e.target.value
          }))
        }
        style={modalInputStyle}
      />

    </div>

    {/* Type */}

    <div>

      <div style={{
        marginBottom: '8px',
        fontSize: '.82rem',
        color: 'var(--muted)'
      }}>
        Reward Type
      </div>

      <select
        value={rewardForm.type}
        onChange={e =>
          setRewardForm(prev => ({
            ...prev,
            type: e.target.value
          }))
        }
        style={modalInputStyle}
      >

        <option
  value="discount"
  style={{
    background: '#111827',
    color: 'white'
  }}
>
  Discount
</option>

<option
  value="free_trip"
  style={{
    background: '#111827',
    color: 'white'
  }}
>
  Free Trip
</option>

<option
  value="free_parcel"
  style={{
    background: '#111827',
    color: 'white'
  }}
>
  Free Parcel
</option>

      </select>

    </div>

  </div>

  {/* Footer */}

  <div style={{
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '28px'
  }}>

    <button
      onClick={() =>
        setShowRewardModal(false)
      }
      style={{
        height: '46px',
        padding: '0 20px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,.08)',
        background: 'rgba(255,255,255,.03)',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 600
      }}
    >
      Cancel
    </button>

    <button
      className="btn btn-primary"
      onClick={saveReward}
      style={{
        height: '46px',
        padding: '0 24px',
        borderRadius: '12px',
        fontWeight: 700
      }}
    >
      Save Reward
    </button>

  </div>

</div>

  </div>

)}
    </div>
  );
}
