import {
  ArrowRight,
  Bell,
  ChevronDown,
  Download,
  FileBarChart,
  FileText,
  LogOut,
  MapPin,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export type ExportReportType = 'complete' | 'city' | 'area' | 'gap'

type HeaderProps = {
  onExport: (type?: ExportReportType) => void
  onLogout?: () => void
}

export function Header({ onExport, onLogout }: HeaderProps) {
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  const exportWrapRef = useRef<HTMLDivElement>(null)
  const noticeWrapRef = useRef<HTMLDivElement>(null)
  const profileWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (exportWrapRef.current && !exportWrapRef.current.contains(target)) {
        setExportOpen(false)
      }
      if (noticeWrapRef.current && !noticeWrapRef.current.contains(target)) {
        setNoticeOpen(false)
      }
      if (profileWrapRef.current && !profileWrapRef.current.contains(target)) {
        setProfileOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExportOpen(false)
        setNoticeOpen(false)
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <span>Workspace</span>
        <span className="breadcrumb-divider">/</span>
        <strong>Government dashboard</strong>
      </div>
      <div className="topbar-actions">
        {/* ── EXPORT REPORT POPOVER WITH QUICK REPORTS OPTIONS ── */}
        <div className="popover-wrap" ref={exportWrapRef}>
          <button
            className={`export-button ${exportOpen ? 'active' : ''}`}
            type="button"
            aria-expanded={exportOpen}
            aria-label="Export report options"
            onClick={() => {
              setExportOpen((open) => !open)
              setNoticeOpen(false)
              setProfileOpen(false)
            }}
          >
            <Download size={15} />
            <span>Export report</span>
          </button>

          {exportOpen && (
            <div className="popover export-popover" role="dialog" aria-label="Quick reports export menu">
              <div className="export-popover-header">
                <div>
                  <h3 className="export-popover-title">Quick reports</h3>
                  <p className="export-popover-subtitle">Export synchronized UIS intelligence</p>
                </div>
                <FileBarChart size={18} className="export-header-icon" />
              </div>

              <div className="export-popover-list">
                <button
                  type="button"
                  className="export-popover-item"
                  onClick={() => {
                    onExport('city')
                    setExportOpen(false)
                  }}
                >
                  <span className="export-item-icon blue">
                    <FileBarChart size={17} />
                  </span>
                  <span className="export-item-info">
                    <span className="export-item-title">City UIS overview</span>
                    <span className="export-item-detail">
                      CSV · city and area UIS values with sector breakdown
                    </span>
                  </span>
                  <span className="export-item-action" title="Download CSV">
                    <Download size={15} />
                  </span>
                </button>

                <button
                  type="button"
                  className="export-popover-item"
                  onClick={() => {
                    onExport('area')
                    setExportOpen(false)
                  }}
                >
                  <span className="export-item-icon green">
                    <MapPin size={17} />
                  </span>
                  <span className="export-item-info">
                    <span className="export-item-title">Area UIS values</span>
                    <span className="export-item-detail">
                      CSV · 6 Nashik zones from citizen dashboard indicators
                    </span>
                  </span>
                  <span className="export-item-action" title="Download CSV">
                    <Download size={15} />
                  </span>
                </button>

                <button
                  type="button"
                  className="export-popover-item"
                  onClick={() => {
                    onExport('gap')
                    setExportOpen(false)
                  }}
                >
                  <span className="export-item-icon orange">
                    <FileText size={17} />
                  </span>
                  <span className="export-item-info">
                    <span className="export-item-title">Infrastructure gap synthesis</span>
                    <span className="export-item-detail">
                      CSV · city-wide gap analysis & policy recommendations
                    </span>
                  </span>
                  <span className="export-item-action" title="Download CSV">
                    <Download size={15} />
                  </span>
                </button>
              </div>

              <button
                type="button"
                className="export-popover-all-btn"
                onClick={() => {
                  onExport('complete')
                  setExportOpen(false)
                }}
              >
                <span>Download complete city report</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>

        <div className="popover-wrap" ref={noticeWrapRef}>
          <button
            className="icon-button notification-button"
            type="button"
            aria-label="Notifications"
            aria-expanded={noticeOpen}
            onClick={() => {
              setNoticeOpen((open) => !open)
              setExportOpen(false)
              setProfileOpen(false)
            }}
          >
            <Bell size={18} />
            <i />
          </button>
          {noticeOpen && (
            <div className="popover notification-popover">
              <strong>Notifications</strong>
              <p>You’re all caught up in this demo workspace.</p>
            </div>
          )}
        </div>

        <div className="popover-wrap" ref={profileWrapRef}>
          <button
            className="profile-button"
            type="button"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((open) => !open)
              setExportOpen(false)
              setNoticeOpen(false)
            }}
          >
            <span className="avatar">GA</span>
            <span className="profile-copy">
              <strong>Gov. Analyst</strong>
              <small>Nashik city office</small>
            </span>
            <ChevronDown size={15} />
          </button>
          {profileOpen && (
            <div className="popover profile-popover">
              <strong>Demo analyst</strong>
              <p>Nashik government dashboard preview</p>
              {onLogout && (
                <button
                  type="button"
                  className="logout-button"
                  onClick={() => {
                    setProfileOpen(false)
                    onLogout()
                  }}
                >
                  <LogOut size={13} />
                  <span>Sign out</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
