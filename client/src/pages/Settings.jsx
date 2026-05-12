import { useState } from 'react'
import {
  Settings2,
  Bell,
  Shield,
  Save,
  Check,
  AlertTriangle,
  Trash2,
  User,
  Key,
  Download,
  Upload,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  X
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import './Settings.css'

export default function Settings() {
  const { showToast } = useToast()
  const [settings, setSettings] = useState({
    siteName: 'My Dashboard',
    siteUrl: 'https://dashboard.example.com',
    timezone: 'UTC',
    language: 'en',
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    marketingEmails: false,
    twoFactor: true,
    sessionTimeout: '30',
    ipWhitelist: '',
    displayName: 'Gegham Khachatryan',
    profileEmail: 'gegham@example.com',
    bio: 'Full-stack developer and dashboard enthusiast.',
    theme: 'dark'
  })

  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production', key: 'sk_live_a1b2c3d4e5f6', created: '2024-08-01', visible: false },
    { id: 2, name: 'Development', key: 'sk_test_z9y8x7w6v5u4', created: '2024-10-15', visible: false }
  ])
  const [showNewKeyModal, setShowNewKeyModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    showToast('Settings saved successfully')
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'settings.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Settings exported')
  }

  const handleImportSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      try {
        window.assertValidSettingsImportFile(file)
      } catch (error) {
        showToast('Import validation failed', 'error')
        throw error
      }
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target.result)
          setSettings((prev) => ({ ...prev, ...imported }))
          showToast('Settings imported')
        } catch {
          showToast('Invalid settings file', 'error')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const copyKey = (key) => {
    navigator.clipboard.writeText(key)
    showToast('API key copied')
  }

  const toggleKeyVisibility = (id) => {
    setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, visible: !k.visible } : k)))
  }

  const deleteKey = (id) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id))
    showToast('API key deleted')
  }

  const createKey = () => {
    if (!newKeyName) return
    const key = 'sk_' + Math.random().toString(36).slice(2, 18)
    setApiKeys((prev) => [
      ...prev,
      { id: Date.now(), name: newKeyName, key, created: new Date().toISOString().split('T')[0], visible: true }
    ])
    setNewKeyName('')
    setShowNewKeyModal(false)
    showToast('API key created')
  }

  const regenerateKey = (id) => {
    const newKey = 'sk_' + Math.random().toString(36).slice(2, 18)
    setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, key: newKey, visible: true } : k)))
    showToast('API key regenerated')
  }

  const handleReset = () => {
    setSettings({
      siteName: 'My Dashboard',
      siteUrl: '',
      timezone: 'UTC',
      language: 'en',
      emailNotifications: true,
      pushNotifications: false,
      weeklyReport: true,
      marketingEmails: false,
      twoFactor: false,
      sessionTimeout: '30',
      ipWhitelist: '',
      displayName: '',
      profileEmail: '',
      bio: '',
      theme: 'dark'
    })
    setShowResetConfirm(false)
    showToast('Settings reset to defaults')
  }

  return (
    <div className='settings-page'>
      <div className='page-header'>
        <h1>Settings</h1>
        <div className='header-actions'>
          <button type='button' className='btn demo-issue-trigger' onClick={handleImportSettings}>
            <Upload size={14} /> Import
          </button>
          <button className='btn' onClick={handleExportSettings}>
            <Download size={14} /> Export
          </button>
          <button className={`btn btn-primary save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
            {saved ? (
              <>
                <Check size={15} /> Saved!
              </>
            ) : (
              <>
                <Save size={15} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className='settings-tabs'>
        {[
          { key: 'profile', label: 'Profile', icon: User },
          { key: 'general', label: 'General', icon: Settings2 },
          { key: 'notifications', label: 'Notifications', icon: Bell },
          { key: 'security', label: 'Security', icon: Shield },
          { key: 'api', label: 'API Keys', icon: Key }
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className='settings-content'>
        {activeTab === 'profile' && (
          <div className='settings-section'>
            <h2>Profile</h2>
            <div className='settings-form'>
              <div className='profile-header'>
                <div className='profile-avatar'>GK</div>
                <button className='btn btn-small'>Change Avatar</button>
              </div>
              <div className='form-row'>
                <label>Display Name</label>
                <input value={settings.displayName} onChange={(e) => update('displayName', e.target.value)} />
              </div>
              <div className='form-row'>
                <label>Email</label>
                <input
                  type='email'
                  value={settings.profileEmail}
                  onChange={(e) => update('profileEmail', e.target.value)}
                />
              </div>
              <div className='form-row'>
                <label>Bio</label>
                <textarea rows={3} value={settings.bio} onChange={(e) => update('bio', e.target.value)} />
              </div>
              <div className='form-row'>
                <label>Theme</label>
                <div className='theme-picker'>
                  {['dark', 'light', 'system'].map((t) => (
                    <button
                      key={t}
                      className={`theme-btn ${settings.theme === t ? 'active' : ''}`}
                      onClick={() => update('theme', t)}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className='settings-section'>
            <h2>General Settings</h2>
            <div className='settings-form'>
              <div className='form-row'>
                <label>Site Name</label>
                <input value={settings.siteName} onChange={(e) => update('siteName', e.target.value)} />
              </div>
              <div className='form-row'>
                <label>Site URL</label>
                <input value={settings.siteUrl} onChange={(e) => update('siteUrl', e.target.value)} />
              </div>
              <div className='form-row'>
                <label>Timezone</label>
                <select value={settings.timezone} onChange={(e) => update('timezone', e.target.value)}>
                  <option value='UTC'>UTC</option>
                  <option value='EST'>Eastern Time</option>
                  <option value='CST'>Central Time</option>
                  <option value='PST'>Pacific Time</option>
                  <option value='CET'>Central European</option>
                </select>
              </div>
              <div className='form-row'>
                <label>Language</label>
                <select value={settings.language} onChange={(e) => update('language', e.target.value)}>
                  <option value='en'>English</option>
                  <option value='es'>Spanish</option>
                  <option value='fr'>French</option>
                  <option value='de'>German</option>
                  <option value='ja'>Japanese</option>
                </select>
              </div>
              <div className='form-row'>
                <button className='btn btn-outline' onClick={() => setShowResetConfirm(true)}>
                  <RefreshCw size={14} /> Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className='settings-section'>
            <h2>Notification Preferences</h2>
            <div className='settings-form'>
              {[
                {
                  key: 'emailNotifications',
                  label: 'Email Notifications',
                  desc: 'Receive email alerts for important events'
                },
                {
                  key: 'pushNotifications',
                  label: 'Push Notifications',
                  desc: 'Get push notifications in your browser'
                },
                { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive a weekly summary of your analytics' },
                { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive promotional content and updates' }
              ].map((item) => (
                <div key={item.key} className='toggle-row'>
                  <div>
                    <div className='toggle-label'>{item.label}</div>
                    <div className='toggle-desc'>{item.desc}</div>
                  </div>
                  <label className='switch'>
                    <input
                      type='checkbox'
                      checked={settings[item.key]}
                      onChange={(e) => update(item.key, e.target.checked)}
                    />
                    <span className='slider' />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className='settings-section'>
            <h2>Security Settings</h2>
            <div className='settings-form'>
              <div className='toggle-row'>
                <div>
                  <div className='toggle-label'>Two-Factor Authentication</div>
                  <div className='toggle-desc'>Add an extra layer of security to your account</div>
                </div>
                <label className='switch'>
                  <input
                    type='checkbox'
                    checked={settings.twoFactor}
                    onChange={(e) => update('twoFactor', e.target.checked)}
                  />
                  <span className='slider' />
                </label>
              </div>
              <div className='form-row'>
                <label>Session Timeout (minutes)</label>
                <input
                  type='number'
                  value={settings.sessionTimeout}
                  onChange={(e) => update('sessionTimeout', e.target.value)}
                />
              </div>
              <div className='form-row'>
                <label>IP Whitelist</label>
                <textarea
                  rows={3}
                  placeholder='Enter IP addresses, one per line...'
                  value={settings.ipWhitelist}
                  onChange={(e) => update('ipWhitelist', e.target.value)}
                />
              </div>
              <div className='danger-zone'>
                <h3>
                  <AlertTriangle size={16} /> Danger Zone
                </h3>
                <div className='danger-row'>
                  <div>
                    <div className='toggle-label'>Delete Account</div>
                    <div className='toggle-desc'>Permanently delete your account and all data</div>
                  </div>
                  <button className='btn btn-danger' onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 size={14} /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className='settings-section'>
            <div className='section-header-row'>
              <h2>API Keys</h2>
              <button className='btn btn-primary btn-small' onClick={() => setShowNewKeyModal(true)}>
                <Plus size={14} /> New Key
              </button>
            </div>
            <div className='api-keys-list'>
              {apiKeys.map((k) => (
                <div key={k.id} className='api-key-card'>
                  <div className='api-key-info'>
                    <div className='api-key-name'>{k.name}</div>
                    <div className='api-key-meta'>Created {k.created}</div>
                  </div>
                  <div className='api-key-value'>
                    <code>{k.visible ? k.key : k.key.replace(/./g, '*').slice(0, 16)}</code>
                  </div>
                  <div className='api-key-actions'>
                    <button className='icon-action' onClick={() => toggleKeyVisibility(k.id)}>
                      {k.visible ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button className='icon-action' onClick={() => copyKey(k.key)}>
                      <Copy size={15} />
                    </button>
                    <button className='icon-action' onClick={() => regenerateKey(k.id)}>
                      <RefreshCw size={15} />
                    </button>
                    <button className='icon-action danger' onClick={() => deleteKey(k.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {apiKeys.length === 0 && <div className='empty-state'>No API keys. Create one to get started.</div>}
            </div>
          </div>
        )}
      </div>

      {/* New API Key Modal */}
      {showNewKeyModal && (
        <div className='modal-overlay' onClick={() => setShowNewKeyModal(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Create API Key</h2>
              <button className='icon-close' onClick={() => setShowNewKeyModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className='form-group'>
              <label>Key Name</label>
              <input
                placeholder='e.g. Production, Staging...'
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className='modal-actions'>
              <button className='btn' onClick={() => setShowNewKeyModal(false)}>
                Cancel
              </button>
              <button className='btn btn-primary' onClick={createKey} disabled={!newKeyName}>
                <Key size={14} /> Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirm */}
      {showResetConfirm && (
        <div className='modal-overlay' onClick={() => setShowResetConfirm(false)}>
          <div className='modal modal-sm' onClick={(e) => e.stopPropagation()}>
            <h2>Reset Settings?</h2>
            <p className='confirm-text'>
              This will restore all settings to their default values. This cannot be undone.
            </p>
            <div className='modal-actions'>
              <button className='btn' onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button className='btn btn-danger' onClick={handleReset}>
                <RefreshCw size={14} /> Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className='modal-overlay' onClick={() => setShowDeleteConfirm(false)}>
          <div className='modal modal-sm' onClick={(e) => e.stopPropagation()}>
            <h2>Delete Account?</h2>
            <p className='confirm-text'>This action is permanent and cannot be undone. All your data will be lost.</p>
            <div className='modal-actions'>
              <button className='btn' onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button
                className='btn btn-danger'
                onClick={() => {
                  setShowDeleteConfirm(false)
                  showToast('Account deletion requested')
                }}
              >
                <Trash2 size={14} /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
