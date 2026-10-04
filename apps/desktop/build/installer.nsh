; The desktop app runs its API server as a second PriPerFin.exe (Electron in
; ELECTRON_RUN_AS_NODE mode). electron-builder's generated uninstaller stops the
; main window process, but the child is a separate image that can keep file
; handles open and make an upgrade-over-install fail to replace files.
!macro customCheckAppRunning
  nsExec::Exec 'taskkill /IM "PriPerFin.exe" /F /T'
  Sleep 500
!macroend
